-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: mysql.stud.ntnu.no
-- Generation Time: Nov 19, 2024 at 03:11 PM
-- Server version: 8.0.40-0ubuntu0.22.04.1
-- PHP Version: 7.4.3-4ubuntu2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `group5_DB_test`
--
CREATE DATABASE IF NOT EXISTS `group5_DB_test` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `group5_DB_test`;

-- --------------------------------------------------------

--
-- Table structure for table `Appraisals`
--

DROP TABLE IF EXISTS `Appraisals`;
CREATE TABLE `Appraisals` (
  `articleId` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `good` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Article`
--

DROP TABLE IF EXISTS `Article`;
CREATE TABLE `Article` (
  `articleId` int NOT NULL,
  `currentVersion` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `views` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ArticleTags`
--

DROP TABLE IF EXISTS `ArticleTags`;
CREATE TABLE `ArticleTags` (
  `tagId` int NOT NULL,
  `articleId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ArticleVersionAuthors`
--

DROP TABLE IF EXISTS `ArticleVersionAuthors`;
CREATE TABLE `ArticleVersionAuthors` (
  `articleVersionId` int NOT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ArticleVersions`
--

DROP TABLE IF EXISTS `ArticleVersions`;
CREATE TABLE `ArticleVersions` (
  `versionId` int NOT NULL,
  `articleId` int NOT NULL,
  `version` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image` mediumblob,
  `username` varchar(50) DEFAULT NULL,
  `versionDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Comments`
--

DROP TABLE IF EXISTS `Comments`;
CREATE TABLE `Comments` (
  `commentId` int NOT NULL,
  `articleId` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `commentText` text NOT NULL,
  `commentDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUpdated` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Tags`
--

DROP TABLE IF EXISTS `Tags`;
CREATE TABLE `Tags` (
  `tagId` int NOT NULL,
  `tagName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profilePicture` mediumblob,
  `bio` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Appraisals`
--
ALTER TABLE `Appraisals`
  ADD PRIMARY KEY (`articleId`,`username`),
  ADD KEY `username` (`username`);

--
-- Indexes for table `Article`
--
ALTER TABLE `Article`
  ADD PRIMARY KEY (`articleId`);

--
-- Indexes for table `ArticleTags`
--
ALTER TABLE `ArticleTags`
  ADD PRIMARY KEY (`tagId`,`articleId`),
  ADD KEY `ArticleTags_ibfk_2` (`articleId`);

--
-- Indexes for table `ArticleVersionAuthors`
--
ALTER TABLE `ArticleVersionAuthors`
  ADD PRIMARY KEY (`articleVersionId`,`username`);

--
-- Indexes for table `ArticleVersions`
--
ALTER TABLE `ArticleVersions`
  ADD PRIMARY KEY (`versionId`),
  ADD UNIQUE KEY `articleId` (`articleId`,`version`),
  ADD KEY `ArticleVersions_ibfk_2` (`username`);

--
-- Indexes for table `Comments`
--
ALTER TABLE `Comments`
  ADD PRIMARY KEY (`commentId`),
  ADD KEY `Comments_ibfk_1` (`articleId`),
  ADD KEY `Comments_ibfk_2` (`username`);

--
-- Indexes for table `Tags`
--
ALTER TABLE `Tags`
  ADD PRIMARY KEY (`tagId`),
  ADD UNIQUE KEY `tagName` (`tagName`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Article`
--
ALTER TABLE `Article`
  MODIFY `articleId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ArticleVersions`
--
ALTER TABLE `ArticleVersions`
  MODIFY `versionId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Comments`
--
ALTER TABLE `Comments`
  MODIFY `commentId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Tags`
--
ALTER TABLE `Tags`
  MODIFY `tagId` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Appraisals`
--
ALTER TABLE `Appraisals`
  ADD CONSTRAINT `Appraisals_ibfk_1` FOREIGN KEY (`articleId`) REFERENCES `Article` (`articleId`) ON DELETE CASCADE,
  ADD CONSTRAINT `Appraisals_ibfk_2` FOREIGN KEY (`username`) REFERENCES `Users` (`username`);

--
-- Constraints for table `ArticleTags`
--
ALTER TABLE `ArticleTags`
  ADD CONSTRAINT `ArticleTags_ibfk_1` FOREIGN KEY (`tagId`) REFERENCES `Tags` (`tagId`) ON DELETE CASCADE,
  ADD CONSTRAINT `ArticleTags_ibfk_2` FOREIGN KEY (`articleId`) REFERENCES `Article` (`articleId`) ON DELETE CASCADE;

--
-- Constraints for table `ArticleVersions`
--
ALTER TABLE `ArticleVersions`
  ADD CONSTRAINT `ArticleVersions_ibfk_1` FOREIGN KEY (`articleId`) REFERENCES `Article` (`articleId`) ON DELETE CASCADE,
  ADD CONSTRAINT `ArticleVersions_ibfk_2` FOREIGN KEY (`username`) REFERENCES `Users` (`username`) ON DELETE CASCADE;

--
-- Constraints for table `Comments`
--
ALTER TABLE `Comments`
  ADD CONSTRAINT `Comments_ibfk_1` FOREIGN KEY (`articleId`) REFERENCES `Article` (`articleId`) ON DELETE CASCADE,
  ADD CONSTRAINT `Comments_ibfk_2` FOREIGN KEY (`username`) REFERENCES `Users` (`username`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
