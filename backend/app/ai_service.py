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
model = genai.GenerativeModel('gemini-2.0-flash')

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
        
        try:
            raw_text = response.text.strip()
        except ValueError:
            # Nếu bị lỗi ValueError nghĩa là AI chặn câu trả lời
            print(f"⚠️ AI chặn phản hồi Tags. Feedback: {response.prompt_feedback}")
            # Fallback về logic cắt chuỗi thủ công
            short_loc = location.split(',')[-1].strip() if ',' in location else location
            return f"Tiện nghi, {short_loc}, Du lịch"
        # ------------------------

        clean_tags = raw_text.replace("\n", "").replace(".", "").replace("*", "")
        print(f"🏷️ Generated Tags: {clean_tags}")
        return clean_tags

    except Exception as e:
        print(f"⚠️ Lỗi SYSTEM tạo Tags: {str(e)}")
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
    
import json

async def calculate_match_score(user_preference: str, accommodations: list) -> list:
    """
    Dùng AI để chấm điểm độ phù hợp.
    Phiên bản Fix Lỗi JSON + Prompt khéo léo.
    """
    try:
        # 1. Chuẩn bị dữ liệu rút gọn
        candidates = []
        for acc in accommodations:
            candidates.append({
                "id": acc.accommodation_id,
                "title": acc.title,
                "desc": acc.description,
                "tags": acc.tags
            })

        # 2. Prompt "Cứng rắn về định dạng" nhưng "Mềm mỏng về nội dung"
        prompt = f"""
        Vai trò: Bạn là một API Backend chỉ trả về JSON.
        Nhiệm vụ: So khớp sở thích người dùng với danh sách chỗ ở.

        Input:
        - Sở thích: "{user_preference}"
        - Ứng viên: {json.dumps(candidates, ensure_ascii=False)}

        Yêu cầu Logic (Copywriter):
        - Viết lý do ngắn gọn (dưới 20 từ) giải thích tại sao chỗ này "có liên quan" đến sở thích.
        - CẤM dùng từ phủ định (VD: "không có núi", "thiếu hồ bơi").
        - Nếu không khớp hoàn toàn, hãy tìm điểm chung về "cảm giác" (Vd: Leo núi -> Cần thiên nhiên -> Nhà vườn cây xanh).
        - Điểm số (score): 0-100.

        Yêu cầu Output (BẮT BUỘC):
        - Chỉ trả về một mảng JSON thuần túy (Array of Objects).
        - Key bắt buộc: "id" (int), "score" (int), "reason" (string).
        - KHÔNG viết thêm bất kỳ lời dẫn, markdown hay giải thích nào khác.
        """

        # 3. Cấu hình ép buộc JSON (Quan trọng)
        generation_config = genai.types.GenerationConfig(
            temperature=0.5, # Tăng nhẹ để văn hay hơn
            response_mime_type="application/json" # <--- THẦN CHÚ: Ép AI trả về JSON chuẩn 100%
        )

        # 4. Gọi AI
        response = await model.generate_content_async(
            prompt,
            generation_config=generation_config
        )
        
        # 5. Xử lý kết quả
        raw_text = response.text.strip()
        
        # DEBUG: In ra xem AI trả về cái gì (Nếu lỗi thì nhìn vào terminal biết ngay)
        print(f"🤖 AI Raw Output: {raw_text[:100]}...") 

        match_results = json.loads(raw_text)
        return match_results

    except Exception as e:
        print(f"❌ Lỗi AI Matchmaker: {e}")
        # Fallback: Nếu AI lỗi, trả về list rỗng (code router sẽ tự fallback về top rate)
        return []
    
async def rank_search_results(user_query: str, accommodations: list, user_preference: str = "") -> list:
    """
    Sắp xếp và LỌC danh sách dựa trên:
    1. Query tìm kiếm (VD: "Chilling")
    2. Sở thích người dùng (VD: "Thích yên tĩnh, ghét ồn ào")
    """
    if not accommodations:
        return []

    try:
        # 1. Chuẩn bị dữ liệu rút gọn
        candidates_json = []
        for acc in accommodations:
            candidates_json.append({
                "id": acc.accommodation_id,
                "info": f"{acc.title} - {acc.tags or ''} - {acc.location} - {acc.description[:100]}"
            })

        # 2. Prompt thông minh hơn
        prompt = f"""
        Nhiệm vụ: Bạn là chuyên gia du lịch. Hãy chọn ra các chỗ ở phù hợp nhất.
        
        1. User Input: "{user_query}"
        2. User Preference (Sở thích cá nhân): "{user_preference}"
        3. Danh sách ứng viên: {json.dumps(candidates_json, ensure_ascii=False)}

        Yêu cầu:
        - Đánh giá độ phù hợp (score 0-100) dựa trên ngữ nghĩa của Input và Sở thích.
        - Ví dụ: User tìm "Chilling", thích "Yên tĩnh" -> Ưu tiên các phòng có tag "Núi", "Hồ", "Vườn".
        - Trả về JSON Array: [{{"id": 1, "score": 90}}, ...]
        """

        generation_config = genai.types.GenerationConfig(
            temperature=0.5,
            response_mime_type="application/json"
        )

        response = await model.generate_content_async(
            prompt,
            generation_config=generation_config
        )
        
        ranking_data = json.loads(response.text.strip())
        score_map = {item['id']: item['score'] for item in ranking_data}

        # 3. Lọc và Sắp xếp
        # Chỉ lấy những phòng có điểm > 0 (AI thấy có liên quan)
        results = []
        for acc in accommodations:
            score = score_map.get(acc.accommodation_id, 0)
            if score > 10: # Ngưỡng lọc (ví dụ > 10 điểm mới lấy)
                acc.match_score = score # Gán điểm ảo để FE hiển thị nếu muốn
                results.append(acc)
        
        # Sắp xếp điểm cao lên đầu
        results.sort(key=lambda x: getattr(x, 'match_score', 0), reverse=True)
        
        return results

    except Exception as e:
        print(f"⚠️ AI Ranking failed: {e}")
        return accommodations # Fallback: trả về nguyên gốc