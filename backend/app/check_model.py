# check_models.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv() # Đọc API Key từ .env

api_key = os.getenv("AI_KEY")

if not api_key:
    print("❌ Lỗi: Không tìm thấy AI_KEY trong file .env")
else:
    print(f"🔑 Đang kiểm tra với Key: {api_key[:5]}...")
    genai.configure(api_key=api_key)

    print("\n📋 Danh sách các Model khả dụng:")
    try:
        for m in genai.list_models():
            # Chỉ liệt kê các model hỗ trợ tạo nội dung (generateContent)
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"❌ Lỗi khi kết nối Google: {e}")