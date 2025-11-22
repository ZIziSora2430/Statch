import google.generativeai as genai
import os

# Lấy API Key từ: https://aistudio.google.com/app/apikey
# Bạn nên lưu trong biến môi trường, ví dụ: os.getenv("GEMINI_API_KEY")

GOOGLE_API_KEY = os.getenv("AI_KEY") 

genai.configure(api_key=GOOGLE_API_KEY)

def generate_tags_from_desc(description: str, location: str) -> str:
    """
    Dùng AI để đọc mô tả + vị trí và trả về string các tags ngăn cách bởi dấu phẩy.
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Bạn là một chuyên gia du lịch. Hãy trích xuất tối đa 5 từ khóa (tags) ngắn gọn, hấp dẫn bằng tiếng Việt dựa trên mô tả và vị trí dưới đây.
        
        Mô tả: "{description}"
        Vị trí: "{location}"
        
        Yêu cầu:
        - Chỉ trả về các từ khóa ngăn cách bởi dấu phẩy (Ví dụ: Gần biển, Yên tĩnh, BBQ).
        - Không thêm lời dẫn, không thêm dấu chấm câu thừa.
        - Tập trung vào tiện ích, không khí (vibe) hoặc vị trí đặc biệt.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Lỗi AI: {e}")
        # Fallback: Nếu AI lỗi thì trả về tag mặc định dựa trên vị trí
        return f"{location}, Du lịch"
    
def generate_description_text(title: str, property_type: str, location: str, features: str) -> str:
    """
    Viết mô tả quảng cáo dựa trên thông tin đầu vào.
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Bạn là một copywriter chuyên nghiệp cho nền tảng đặt phòng du lịch (như Airbnb).
        Hãy viết một đoạn mô tả hấp dẫn, lôi cuốn (khoảng 100-150 từ) bằng tiếng Việt cho chỗ ở sau:
        
        - Tên chỗ ở: {title}
        - Loại hình: {property_type}
        - Vị trí: {location}
        - Các điểm nổi bật (features): {features}
        
        Yêu cầu:
        - Dùng giọng văn thân thiện, mời gọi khách du lịch.
        - Nhấn mạnh vào các tiện ích và vị trí.
        - Sử dụng emoji phù hợp để bài viết sinh động.
        - Không cần chào hỏi, vào thẳng nội dung mô tả.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Lỗi AI: {e}")
        return f"Chào mừng bạn đến với {title} tại {location}. Đây là một {property_type} tuyệt vời với {features}."