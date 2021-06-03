<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 캐시파일을 삭제한다.
 * 
 * @file /process/@deleteCache.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.1.2
 * @modified 2021. 6. 3.
 */
if (defined('__MINITALK__') == false) exit;

$names = Request('names') ? json_decode(Request('names')) : null;
for ($i=0, $loop=count($names);$i<$loop;$i++) {
	if (preg_match('/\.cache$/',$names[$i]) == false) continue;
	
	@unlink($this->getAttachmentPath().'/cache/'.$names[$i]);
}

$results->success = true;
?>