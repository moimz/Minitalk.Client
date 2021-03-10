<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 이모티콘 폴더 접근을 막기 위한 인덱스파일
 * 
 * @file /emoticons/index.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.1
 * @modified 2021. 3. 10.
 */
header("HTTP/1.1 403 Forbidden");
header('location:../');
?>