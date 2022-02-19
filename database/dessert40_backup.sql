-- MySQL dump 10.13  Distrib 8.0.20, for Win64 (x86_64)
--
-- Host: localhost    Database: dessert40
-- ------------------------------------------------------
-- Server version	8.0.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_code` int NOT NULL AUTO_INCREMENT,
  `product_count` varchar(45) DEFAULT NULL,
  `product_code` int NOT NULL,
  `member_code` int NOT NULL,
  PRIMARY KEY (`cart_code`),
  KEY `product_code` (`product_code`),
  KEY `member_code` (`member_code`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`product_code`) REFERENCES `products` (`product_code`),
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`member_code`) REFERENCES `members` (`member_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_code` int NOT NULL AUTO_INCREMENT COMMENT '이벤트 코드',
  `event_title` varchar(50) NOT NULL COMMENT '제목',
  `event_link` varchar(255) DEFAULT NULL COMMENT '링크',
  `event_img` varchar(255) DEFAULT NULL COMMENT '썸네일 사진',
  `event_show` enum('Y','N') NOT NULL DEFAULT 'Y' COMMENT '배너노출여부 Y= 공개, N = 비공개',
  PRIMARY KEY (`event_code`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'테스트1','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(2,'테스트2','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(3,'테스트3','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(4,'테스트4','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(5,'테스트5','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(6,'열일하는갱얼쥐','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(7,'테슷흐','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(8,'테슷흐흐흐><','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(9,'테슷흐흐흐><1','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(10,'테슷흐흐흐><2','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(11,'테슷흐흐흐><3','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y'),(12,'테슷흐흐흐><4','https://www.paris.co.kr/promotion/2022-strawberry-fair/','/upload/1645288310375.png','Y');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `member_code` int NOT NULL AUTO_INCREMENT COMMENT '회원일련번호',
  `member_id` varchar(30) NOT NULL COMMENT '아이디',
  `member_email` varchar(255) NOT NULL COMMENT '이메일',
  `member_pw` varchar(255) NOT NULL COMMENT '비밀번호',
  `member_name` varchar(30) NOT NULL COMMENT '회원명',
  `member_phone` varchar(20) NOT NULL COMMENT '전화번호',
  `member_postcode` char(5) DEFAULT NULL COMMENT '우편번호',
  `member_addr1` varchar(255) DEFAULT NULL COMMENT '검색된 주소',
  `member_addr2` varchar(255) DEFAULT NULL COMMENT '나머지 주소',
  `member_birth` date NOT NULL COMMENT '생년월일',
  `admin` enum('Y','N') NOT NULL COMMENT '관리자여부',
  `reg_date` datetime NOT NULL COMMENT '가입한날짜',
  `is_out` enum('Y','N') NOT NULL COMMENT '탈퇴여부',
  PRIMARY KEY (`member_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'woody','dazoo0221@hanmail.net','1234','우디','01012341232','12345','서울 강남구 논현동','도산대로 28길','2000-11-12','N','2022-02-11 00:00:00','N'),(2,'paos','ajdi1@assdq.com','112312','최준','01029310213','10291','서울시 동작구 대방동','123-213','1997-11-20','N','2022-02-08 16:20:57','Y'),(3,'seul5106','seul5106@naver.com','han3333','정한슬','01090570451','05695','서울 송파구 가락로12길 4','asdasd','2022-01-30','N','2022-02-09 00:00:00','N'),(4,'aaasdasdasd','seul5106@naver.com','han3588s1','정한슬','01090570451','01030','서울 강북구 삼양로123길 1','ㅁㄴㅇㅁㄴㅇ','2022-02-03','N','2022-02-09 00:00:00','N'),(5,'seulda','seul5106@naver.com','han3588s1','정한슬','01090570451','05315','서울 강동구 양재대로123길 7','1234','2022-02-02','N','2022-02-09 18:07:34','N'),(6,'han3588s1','seul5106@gmail.com','han3588s1','정한슬','01090570451','05237','서울 강동구 암사동 445-15','asdasdasd','2022-02-23','N','2022-02-11 18:00:44','N'),(7,'seul51064','seul5106@gmail.com','han3588s1!!','정한슬1','01090570451','14125','주소다아아아아아','주소임이이이이','1995-02-04','Y','2022-02-14 16:00:38','N');

/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `order_detail_code` int NOT NULL AUTO_INCREMENT COMMENT '주문상세번호',
  `order_quantity` int NOT NULL COMMENT '주문수량',
  `order_price` int NOT NULL COMMENT '가격',
  `product_code` int NOT NULL,
  `order_code` int NOT NULL,
  PRIMARY KEY (`order_detail_code`),
  KEY `product_code` (`product_code`),
  KEY `order_code` (`order_code`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`product_code`) REFERENCES `products` (`product_code`),
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`order_code`) REFERENCES `orders` (`order_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_code` int NOT NULL AUTO_INCREMENT COMMENT '주문일련번호',
  `merchant_uid` varchar(45) DEFAULT NULL,
  `order_state` enum('Y','C') NOT NULL COMMENT '주문상태 ( Y = 주문완료,C = 취소)',
  `order_date` datetime NOT NULL COMMENT '주문날짜',
  `order_total_price` int DEFAULT NULL COMMENT '총가격',
  `receiver_name` varchar(30) DEFAULT NULL COMMENT '수령자이름',
  `receiver_phone` varchar(20) DEFAULT NULL COMMENT '수령자 전화번호',
  `receiver_addr1` char(5) DEFAULT NULL COMMENT '배송지 주소1(우편번호)',
  `receiver_addr2` varchar(255) DEFAULT NULL COMMENT '배송지 주소2(검색된 주소)',
  `receiver_addr3` varchar(255) DEFAULT NULL COMMENT '배송지 주소3(나머지 주소)',
  `imp_uid` varchar(45) DEFAULT NULL,
  `rq_cancel` enum('Q','A') DEFAULT NULL,
  `member_code` int NOT NULL,
  PRIMARY KEY (`order_code`),
  KEY `member_code` (`member_code`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`member_code`) REFERENCES `members` (`member_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_code` int NOT NULL AUTO_INCREMENT COMMENT '상품번호',
  `product_name` varchar(30) NOT NULL COMMENT '상품명',
  `product_price` int NOT NULL COMMENT '가격',
  `product_stock` int NOT NULL COMMENT '수량(재고)',
  `product_img` varchar(255) NOT NULL COMMENT '상품이미지',
  `product_categorie` varchar(20) NOT NULL COMMENT '카테고리',
  `product_desc` varchar(255) DEFAULT NULL COMMENT '설명',
  `product_nutri` varchar(255) DEFAULT NULL COMMENT '영양정보',
  `product_allergy` varchar(255) DEFAULT NULL COMMENT '알레르기',
  `product_date` date DEFAULT NULL COMMENT '등록날짜',
  `product_state` enum('Y','N') NOT NULL COMMENT '상품 상태 Y= 공개, N = 비공개',
  PRIMARY KEY (`product_code`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (44,'말랑말랑 치즈 케이크',5000,131,'/upload/1644982463828.png','t','엄청나게 큰  호두 케이크타워입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 12:34:23','Y'),(45,'말랑말랑 초코 케이크',5000,131,'/upload/1644982501138.png','t','초코 케이크 조각입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 12:35:01','Y'),(46,'보송보송 케이크',9000,20130,'/upload/1644986741881.png','t','달콤한 우유 크림이 얹어진 빵입니다.','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 13:45:41','Y'),(47,'우유 생크림 케이크',4500,120,'/upload/1644986818388.png','t','생크림과 달콤한 특제 소스로 무장한 케이크 타워입니다.','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 13:46:58','Y'),(48,'화이트 초콜렛 쿠키',4000,1000,'/upload/1644993181686.png','t','보기엔 좀 그래도 맛있다구요','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:33:01','Y'),(49,'초코 분쇄기 쿠키',4500,1000,'/upload/1644993263114.png','t','당신의 이빨을 부숴드리죠','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:34:23','Y'),(50,'커리 쿠키',3900,2013,'/upload/1644993341945.png','t','커리(curry)가 들어있는 강황마니아 쿠키입니다.','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:35:41','Y'),(51,'딸기 빙수',14000,1203,'/upload/1644993574993.png','t','딸기와 치즈가 동동 떠있는 막걸리같은 빙수입니다.','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:39:35','Y'),(52,'죠리퐁 빙수',8000,1200,'/upload/1644993669502.png','t','죠리퐁과 검은콩으로 고소한 빙수를 맛보세요','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:41:09','Y'),(53,'플랑크톤 마카롱',3000,2000,'/upload/1644993744959.png','t','플랑크톤이 좋아하는 마카롱','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:42:24','Y'),(54,'딸기와 마늘 빙수',6000,192,'/upload/1644993841742.png','t','마늘과 딸기는 안 어울릴거라 생각하시죠?','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:44:01','Y'),(55,'녹차 오믈렛',8000,1021,'/upload/1644993885809.png','t','녹차 오믈렛입니다.','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:44:45','Y'),(56,'버터링 오믈렛',10200,102,'/upload/1644993962201.png','t','버터링같이 생긴 오믈렛입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:46:02','Y'),(57,'크런키 빙수',7000,1929,'/upload/1644994028368.png','t','초코 크런키가 들어간 빙수입니다.','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:47:08','Y'),(58,'치즈 베이비',15130,2013,'/upload/1644994105134.png','b','가운데 퐁당 빠지고 싶은 치즈 크림이 듬뿍 들어간 베이비입니다','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:48:25','Y'),(59,'스폰지밥 마카롱',14000,2013,'/upload/1644994185478.png','m','스폰지밥이 약간 들어간 마카롱입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:49:45','Y'),(60,'달달 크루아상',7000,1231,'/upload/1644994275510.png','b','그냥 크루아상입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:51:15','Y'),(61,'커스타드 크로칸 슈',15000,2013,'/upload/1644994370359.png','b','슈크림이 들어간 브레드입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','asd','2022-02-16 15:52:50','Y'),(62,'소세지 브레드',5000,1021,'/upload/1644994436022.png','b','소세지가 가득찬 빵입니다.','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:53:56','Y'),(63,'프렌치 쿠키슈',13100,1232,'/upload/1644994525282.png','b','달콤한 우유 크림이 안에 들어간 빵입니다','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:55:25','Y'),(64,'순우유크림 케이크',23000,1020,'/upload/1644994574869.png','t','순우유크림에 흠뻑 빠진 케이크입니다','총 내용량 (390g) 1300 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:56:14','Y'),(65,'프렌치 쿠키슈(밀키쇼콜라)',14000,2013,'/upload/1644994652734.png','b','달콤한 우유크림과 초코 향이 가미된 빵입니다','총 내용량 (390g) 1100 kcal 총 내용량당 (% : 1일 영양성분기준치에 대한 비율) - 나트륨 : 1180mg / 59% · 당류 : 29g /29% · 포화지방 : 11g / 73% · 단백질 : 22g / 40%','밀, 계란, 대두, 우유, 쇠고기, 땅콩 함유','2022-02-16 15:57:32','Y');

/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qnas`
--

DROP TABLE IF EXISTS `qnas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qnas` (
  `qna_code` int NOT NULL AUTO_INCREMENT COMMENT 'qna번호',
  `qna_title` varchar(20) NOT NULL COMMENT '제목',
  `qna_desc` varchar(255) NOT NULL COMMENT '내용',
  `qna_answer` varchar(255) DEFAULT NULL COMMENT '관리자답변',
  `qna_state` enum('Y','N') DEFAULT 'N' COMMENT '답변상태 Y = 완료, N = 미완료',
  `qna_date` date NOT NULL COMMENT '작성날짜',
  `member_code` int NOT NULL,
  PRIMARY KEY (`qna_code`),
  KEY `member_code` (`member_code`),
  CONSTRAINT `qnas_ibfk_1` FOREIGN KEY (`member_code`) REFERENCES `members` (`member_code`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qnas`
--

LOCK TABLES `qnas` WRITE;
/*!40000 ALTER TABLE `qnas` DISABLE KEYS */;
INSERT INTO `qnas` VALUES (30,'배송문의','배송? 헤헤',NULL,'N','2022-02-14',1),(31,'배송문의','배송? 헤헤',NULL,'N','2022-02-14',1),(32,'배송문의','배송? 헤헤',NULL,'N','2022-02-14',1),(33,'배송문의','배송? 헤헤 테스트',NULL,'N','2022-02-14',1),(34,'배송문의','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎ',NULL,'N','2022-02-14',1),(35,'배송문의1/테스트','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1),(36,'배송문의1/테스트35','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1),(37,'배송문의1/테스트35','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1),(38,'배송문의1/테스트37','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1),(39,'배송문의1/테스트38','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1),(40,'배송문의1/테스트39','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1),(42,'배송문의1/테스트41','배송? 헤헤 테스트 번호 수정 되나 안되나 테스트^_ㅜ ㅎㅎ',NULL,'N','2022-02-14',1);
/*!40000 ALTER TABLE `qnas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-18 14:42:26
