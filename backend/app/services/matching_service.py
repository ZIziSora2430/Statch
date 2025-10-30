from app.database import get_db_connection
import mysql.connector

def process_match(user_id: int, accommodation_id: int):
    db = get_db_connection()
    if not db: 
        raise Exception("Khong the ket noi CSDL")
    
    cursor = db.cursor(dictionary=True)

    try: 
        cursor.execute(
            "SELECT max_guest FROM accommodation where accommodation_id = %s",
            (accommodation_id,)
        )
        room = cursor.fetchone()
        if not room: 
            raise Exception(f"Phòng với ID {accommodation_id} không tồn tại")

        max_guest = room['max_guest']

        #Kiem tra xem chinh minh da yeu cau truoc do chua
        cursor.execute(
            # Lấy tất cả các cột từ bảng matching khi ng dùng hiện tại gọi API, đúng cái phòng được yêu cầu, và yêu cầu đó phải còn đang chờ
            "SELECT * FROM Matching WHERE user_id = %s AND accommodation_id = %s AND (status = 'pending' OR status = 'matched')",
            (user_id, accommodation_id)
        )
        my_request = cursor.fetchone()

        if my_request: 
            if my_request['status'] == 'pending':
                return {"status": "pending", "message": "Ban da yeu cau. Dang cho...", "match_id": my_request['matching_id']}
            else: # status == 'matched'
                return {"status": "matched", "message": "Bạn đã được ghép đôi ở phòng này"}
        

        # Đếm số người hiện tại (nếu user này là người mới)
        cursor.execute(
            "SELECT COUNT(*) as current_guests FROM Matching WHERE accommodation_id = %s AND (status = 'pending' OR status = 'matched')",
            (accommodation_id,)
        )
        current_guests = cursor.fetchone()['current_guests']

        if current_guests >= max_guest: 
            return {
                "status": "full",
                "message": f"Phòng này đã đủ {max_guest} người. Không thể tham gia."
            }

        #Tim nguoi khac dang cho pending phong nay
        cursor.execute(
            #Lấy tất cả các cột từ bảng matching thỏa phải cùng 1 phòng mà người dùng hiện tại đang yêu cầu, phải là của một người dùng khác,
            # người đó cũng đang trong trạng thái chờ, chỉ cần tìm 1 hàng đầu tiên rồi dừng lại và trả về ngay  
            "SELECT * FROM Matching WHERE accommodation_id = %s AND user_id != %s AND status = 'pending' LIMIT 1",
            (accommodation_id, user_id)
        )
        potential_match = cursor.fetchone()

        if potential_match:
            # TH: Tim thay match
            other_user_id = potential_match['user_id']
            other_match_id = potential_match['matching_id']

            cursor.execute(
                # Sửa dữ liệu trong bản matching, đặt giá trị của cột status = 'matched', và chỉ thực hiện sửa cho đúng cái hàng của người mà vừa tìm thấy
                "UPDATE Matching SET status = 'matched' WHERE matching_id = %s",
                 (other_match_id,)
            )

            cursor.execute(
                "INSERT INTO Matching (user_id, accommodation_id, status, pair_id) VALUES (%s, %s, 'matched', %s)",
                (user_id, accommodation_id, other_match_id)
            )
            my_new_match_id = cursor.lastrowid

            cursor.execute(
                "UPDATE Matching SET pair_id = %s WHERE matching_id = %s",
                (my_new_match_id, other_match_id)
            )

            db.commit()

            return {
                "status": "matched",
                "message": f"Ghép đôi thành công với người dùng {other_user_id}!",
                "matched_with_user_id": other_user_id
            }
        
        else:
            #TH: Khong tim thay ai
            cursor.execute(
                "INSERT INTO Matching (user_id, accommodation_id, status) VALUES (%s, %s, 'pending')",
                (user_id, accommodation_id)
            )
            db.commit()
            new_match_id = cursor.lastrowid

            return {
                "status": "pending",
                "message": "Bạn là người đầu tiên. Chúng tôi sẽ thông báo khi có người tham gia.",
                "match_id": new_match_id
            }
        
    except mysql.connector.Error as err: 
        print(f"Loi SQL: {err}")
        db.rollback()
        raise Exception(f"Loi CSDL: {err}")
    
    finally: 
        cursor.close()
        db.close()