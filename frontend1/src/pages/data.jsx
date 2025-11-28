import Avatar from '../images/Avatar.png';



// Dữ liệu giả, đã cập nhật thêm bình luận và có trả lời

export const MOCK_POSTS = [

  {

    id: 1,

    username: "Nguyễn Văn A",

    avatar: Avatar,

    time: "2 giờ trước",

    city: "Hà Nội",

    content: "Hôm nay tôi ăn phở ở quán gánh Hàng Chiếu ngon quá! Ai đã thử chưa?",

    likes: 15,

    comments: 4, // Cập nhật số lượng

    commentDetails: [

        { id: 101, user: "Trần Thị B", content: "Đúng đó bạn, phở Gánh ngon nhất Hà Nội!" },

        { id: 102, user: "Lê Văn C", content: "Mình cũng muốn thử, cho mình địa chỉ với." },

        { id: 103, user: "Nguyễn Văn A", content: "@Lê Văn C 41 Hàng Chiếu nhé bạn, quán vỉa hè thôi." },

        { id: 104, user: "Lê Văn C", content: "@Trần Thị B Mình vừa ăn thử, công nhận ngon thật!" }

    ]

  },

  {

    id: 2,

    username: "Trần Thị B",

    avatar: Avatar,

    time: "5 giờ trước",

    city: "TP. Hồ Chí Minh",

    content: "Đang tìm kiếm quán cà phê yên tĩnh ở Quận 1 để làm việc. Có ai gợi ý không?",

    likes: 30,

    comments: 3, // Cập nhật số lượng

    commentDetails: [

        { id: 201, user: "Nguyễn Văn A", content: "Bạn thử The Workshop xem, không gian ổn lắm." },

        { id: 202, user: "Trần Thị B", content: "@Nguyễn Văn A Cảm ơn bạn, mình sẽ ghé thử!" },

        { id: 203, user: "Phạm Hùng", content: "Mình hay ra The Fig, cũng yên tĩnh lắm." }

    ]

  },

  {

    id: 3,

    username: "Lê Văn C",

    avatar: Avatar,

    time: "1 ngày trước",

    city: "Đà Nẵng",

    content: "Thời tiết Đà Nẵng dạo này tuyệt vời, rất thích hợp để đi biển Mỹ Khê!",

    likes: 45,

    comments: 0, // Vẫn giữ 1 post không có bình luận để test

    commentDetails: []

  },

  {

    id: 4,

    username: "Phạm Hùng",

    avatar: Avatar,

    time: "2 ngày trước",

    city: "Hội An",

    content: "Cuối tuần này đi Hội An, nên ăn gì đầu tiên mọi người ơi? Cao lầu hay bánh mỳ Phượng?",

    likes: 72,

    comments: 6, // Post này có 6 bình luận

    commentDetails: [

        { id: 401, user: "Nguyễn Văn A", content: "Phải thử cao lầu chứ, đặc sản mà!" },

        { id: 402, user: "Trần Thị B", content: "Mình lại mê bánh mỳ Phượng hơn, ăn xong đi uống nước mót." },

        { id: 403, user: "Lê Văn C", content: "Cơm gà Bà Buội nữa bạn ơi, đừng bỏ qua." },

        { id: 404, user: "Nguyễn Văn A", content: "@Trần Thị B Bánh mỳ Phượng giờ cũng bình thường, mình thấy Bánh mỳ Madam Khánh ngon hơn." },

        { id: 405, user: "Phạm Hùng", content: "Cảm ơn mọi người, nhiều lựa chọn quá! Chắc mình phải ở cả tuần mất." },

        { id: 406, user: "Trần Thị B", content: "@Nguyễn Văn A Ồ vậy à, để lần sau mình thử Madam Khánh." }

    ]

  },

];