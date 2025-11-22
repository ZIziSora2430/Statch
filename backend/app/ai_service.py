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

async def generate_tags_from_desc(description: str, location: str) -> str:
    """
    Dùng AI để trích xuất 3-5 từ khóa (tags) quan trọng nhất.
    Phiên bản Async + Prompt tối ưu + Xử lý chuỗi kỹ hơn.
    """
    try:
        # 1. Prompt được cải tiến (Few-Shot Prompting - Cung cấp ví dụ mẫu)
        prompt = f"""
        Bạn là chuyên gia SEO du lịch. Nhiệm vụ: Trích xuất đúng 3 đến 5 từ khóa (tags) ngắn gọn nhất (2-4 từ/tag) mô tả tiện ích nổi bật và không khí của chỗ ở này.

        Dữ liệu đầu vào:
        - Mô tả: "{description}"
        - Vị trí: "{location}"

        Ví dụ mẫu (Hãy học theo định dạng này):
        Input: Mô tả "Nhà có hồ bơi vô cực, view nhìn thẳng ra biển, rất hợp để nướng BBQ tối. Wifi mạnh." - Vị trí "Vũng Tàu"
        Output: Hồ bơi vô cực, View biển, BBQ sân vườn, Wifi mạnh, Gần biển

        Yêu cầu bắt buộc:
        1. Chỉ trả về danh sách từ khóa ngăn cách bởi dấu phẩy.
        2. KHÔNG xuống dòng, KHÔNG gạch đầu dòng, KHÔNG số thứ tự.
        3. Ưu tiên các từ khóa thu hút khách du lịch (Vd: Gần trung tâm, Có bồn tắm, Chill, Yên tĩnh).
        4. Tiếng Việt chuẩn.
        """

        # 2. Cấu hình an toàn (Tránh bị chặn vì từ khóa nhạy cảm trong mô tả)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        # 3. Gọi Async để không chặn server
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=100, # Giới hạn ngắn thôi cho tiết kiệm
                temperature=0.5        # Giảm độ sáng tạo để tags chính xác hơn
            ),
            safety_settings=safety_settings
        )
        
        # 4. Xử lý hậu kỳ (Clean text)
        raw_text = response.text.strip()
        # Loại bỏ các ký tự thừa nếu AI lỡ thêm vào (dấu chấm cuối câu, dấu xuống dòng)
        clean_tags = raw_text.replace("\n", "").replace(".", "").replace("*", "")
        
        print(f"🏷️ Generated Tags: {clean_tags}")
        return clean_tags

    except Exception as e:
        print(f"⚠️ Lỗi tạo Tags: {e}")
        # Fallback thông minh hơn: Lấy tên quận/thành phố từ location làm tag
        short_loc = location.split(',')[-1].strip() if ',' in location else location
        return f"Tiện nghi đầy đủ, {short_loc}, Du lịch"
    
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