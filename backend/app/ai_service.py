import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold # 1. Import thêm cái này
import os
from dotenv import load_dotenv 

load_dotenv()

# Lấy API Key từ: https://aistudio.google.com/app/apikey

GOOGLE_API_KEY = os.getenv("AI_KEY")

if not GOOGLE_API_KEY:
    print("⚠️ CẢNH BÁO: Chưa tìm thấy AI_KEY trong biến môi trường!")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('models/gemini-2.5-flash')

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
    
async def generate_description_text(title: str, property_type: str, location: str, features: str) -> str:
    try:
        # Prompt (Câu lệnh)
        prompt = f"""
        Bạn là copywriter chuyên nghiệp. Viết một đoạn mô tả ngắn (khoảng 50 từ) cho chỗ ở du lịch:
        - Tên: {title}
        - Loại hình: {property_type}
        - Địa chỉ: {location}
        - Đặc điểm: {features}
        
        Yêu cầu: Tiếng Việt, giọng văn thân thiện, hấp dẫn, dùng emoji. Không cần tiêu đề.
        """
        
        # 2. CẤU HÌNH AN TOÀN (Tắt bộ lọc để tránh bị chặn nhầm)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        # 3. GỌI API
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=2000, 
                temperature=0.7
            ),
            safety_settings=safety_settings
        )
        
        # 4. DEBUG: In phản hồi thô ra Terminal để kiểm tra (Quan trọng)
        print(f"🔎 RAW RESPONSE: {response}")

        # 5. THỬ LẤY TEXT MỘT CÁCH AN TOÀN
        try:
            # Thuộc tính .text sẽ tự động báo lỗi nếu bị chặn hoặc không có nội dung
            return response.text.strip()
        except ValueError:
            # Nếu lỗi ValueError xảy ra, nghĩa là AI từ chối trả lời
            feedback = response.prompt_feedback
            reason = "Không rõ lý do"
            
            if feedback:
                print(f"❌ Prompt Feedback: {feedback}")
                reason = f"Bị chặn bởi bộ lọc (BlockReason: {feedback.block_reason})"
            
            if response.candidates and response.candidates[0].finish_reason:
                reason += f" - Finish Reason: {response.candidates[0].finish_reason.name}"

            return f"AI không thể tạo nội dung. ({reason})"

    except Exception as e:
        print(f"❌ LỖI HỆ THỐNG AI: {str(e)}")
        return f"Lỗi hệ thống: {str(e)}"