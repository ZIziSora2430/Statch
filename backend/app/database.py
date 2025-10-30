import mysql.connector



def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password="na21",
            database="statch_db"
        )
        if conn.is_connected(): 
            return conn
    except mysql.connector.Error as err:
        print(f"Lỗi kết nối CSDL: {err}")
        return None
    
