-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: 192.168.1.117    Database: mx
-- ------------------------------------------------------
-- Server version	5.5.54-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `mx_org`
--

DROP TABLE IF EXISTS `mx_org`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_org` (
  `org_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `name` varchar(110) COLLATE utf8_bin DEFAULT NULL COMMENT '组织名称',
  `shorter` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `is_school` varchar(2) COLLATE utf8_bin DEFAULT '1',
  `type` varchar(2) COLLATE utf8_bin DEFAULT '1' COMMENT '0:非正式组织， 1：正式组织',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`org_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='组织';
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `mx_app`
--

DROP TABLE IF EXISTS `mx_app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_app` (
  `app_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `name` varchar(130) COLLATE utf8_bin NOT NULL COMMENT '功能名',
  `isblank` varchar(1) COLLATE utf8_bin DEFAULT '0' COMMENT '0:不开子页面， 1：开子页面',
  `domain` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT '主域名，如果为空则为当前域名',
  `href` varchar(270) COLLATE utf8_bin DEFAULT NULL COMMENT '链接',
  `type` varchar(2) COLLATE utf8_bin NOT NULL DEFAULT '0' COMMENT '状态:0归属普通用户，1归属企业账户，2归属超级管理员',
  `position` varchar(2) COLLATE utf8_bin DEFAULT '0' COMMENT '所处位置：1主菜单， 2下拉',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  PRIMARY KEY (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='功能';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mx_app_funs`
--

DROP TABLE IF EXISTS `mx_app_funs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_app_funs` (
  `fun_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `app_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `name` varchar(130) COLLATE utf8_bin NOT NULL COMMENT '功能名',
  `href` varchar(270) CHARACTER SET utf8 NOT NULL COMMENT '子功能标识',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  `type` varchar(2) COLLATE utf8_bin NOT NULL DEFAULT '0' COMMENT '类型：0非ifram, 1ifram',
  PRIMARY KEY (`fun_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='子功能';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mx_dept`
--

DROP TABLE IF EXISTS `mx_dept`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_dept` (
  `dept_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `org_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `father_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '机构的父键ID',
  `name` varchar(110) COLLATE utf8_bin DEFAULT NULL COMMENT '机构名称',
  `shorter` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `level` int(5) DEFAULT NULL COMMENT '层级',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='机构';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mx_dept_user`
--

DROP TABLE IF EXISTS `mx_dept_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_dept_user` (
  `deptuser_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `org_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `dept_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `user_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `role_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '角色ID',
  `status` varchar(2) COLLATE utf8_bin NOT NULL DEFAULT '1' COMMENT '状态:0待审，1已审核， 2审核未通过',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  PRIMARY KEY (`deptuser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='机构用户';
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `mx_role`
--

DROP TABLE IF EXISTS `mx_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_role` (
  `role_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `org_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `name` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '名称',
  `status` varchar(2) COLLATE utf8_bin NOT NULL DEFAULT '1' COMMENT '状态:0待考虑是否可以操作，1可以操作， 2锁定，不能操作',
  `type` varchar(30) COLLATE utf8_bin NOT NULL DEFAULT '-1' COMMENT '角色类型：student：学生， teacher：老师  ，-1：其它未知',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='角色';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mx_role_app`
--

DROP TABLE IF EXISTS `mx_role_app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_role_app` (
  `role_app_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `role_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `app_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '外键ID',
  `status` varchar(2) COLLATE utf8_bin NOT NULL DEFAULT '1' COMMENT '状态:0未授权，不能使用，1已授权，可以使用',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  PRIMARY KEY (`role_app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='角色的功能';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mx_user`
--

DROP TABLE IF EXISTS `mx_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mx_user` (
  `user_id` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '主键ID',
  `account` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '账号',
  `password` varchar(128) COLLATE utf8_bin NOT NULL COMMENT '密码',
  `fullname` varchar(64) COLLATE utf8_bin NOT NULL COMMENT '全名',
  `isadmin` varchar(2) COLLATE utf8_bin NOT NULL DEFAULT '0' COMMENT '是否为超级管理员',
  `eamil` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '邮箱',
  `tel` varchar(20) COLLATE utf8_bin DEFAULT NULL COMMENT '手机号',
  `isvalid` varchar(1) COLLATE utf8_bin DEFAULT '1' COMMENT '0:无效， 1：有效',
  `creater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '创建者',
  `updater` varchar(64) COLLATE utf8_bin DEFAULT NULL COMMENT '更新者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` text COLLATE utf8_bin COMMENT '备注',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'mx'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-08 10:23:55
