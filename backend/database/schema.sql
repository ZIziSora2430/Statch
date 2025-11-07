CREATE DATABASE IF NOT EXISTS statch_db;
USE statch_db;

-- -----------------------------------------------------
-- Bảng 1: Users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  users_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(50),
  age INT,
  password VARCHAR(255) NOT NULL,
  bio VARCHAR(100),
  role ENUM('traveler', 'owner') NOT NULL DEFAULT 'traveler'
);

-- -----------------------------------------------------
-- Bảng 2: Accommodation
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Accommodation (
  accommodation_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT(500), 
  location VARCHAR(255),
  property_type VARCHAR(100),
  max_guests INT,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  picture_url VARCHAR(255),
  FOREIGN KEY (owner_id) REFERENCES Users(users_id)
);

-- -----------------------------------------------------
-- Bảng 3: Booking
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Booking (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  accommodation_id INT,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_confirmation',
  FOREIGN KEY (user_id) REFERENCES Users(users_id),
  FOREIGN KEY (accommodation_id) REFERENCES Accommodation(accommodation_id)
);

-- -----------------------------------------------------
-- Bảng 4: Review
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Review (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  accommodation_id INT,
  user_id INT,
  rating INT NOT NULL,
  content TEXT,
  FOREIGN KEY (accommodation_id) REFERENCES Accommodation(accommodation_id),
  FOREIGN KEY (user_id) REFERENCES Users(users_id)
);

-- -----------------------------------------------------
-- Bảng 5: Matching
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Matching (
  matching_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  accommodation_id INT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  pair_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(users_id),
  FOREIGN KEY (accommodation_id) REFERENCES Accommodation(accommodation_id),
  FOREIGN KEY (pair_id) REFERENCES Matching(matching_id)
);

-- -----------------------------------------------------
-- Bảng 6: ChatMessage
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ChatMessage (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  matching_id INT,
  sender_id INT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matching_id) REFERENCES Matching(matching_id),
  FOREIGN KEY (sender_id) REFERENCES Users(users_id)
);