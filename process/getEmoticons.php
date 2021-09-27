<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 이모티콘 폴더를 읽어, 이모티콘 그룹을 가져온다.
 * 
 * @file /process/getEmoticons.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.6.0
 * @modified 2021. 9. 27.
 */
if (defined('__MINITALK__') == false) exit;

$emoticons = array();
foreach (GetDirectoryItems(__MINITALK_PATH__.'/emoticons','directory') as $emoticon) {
	if (is_file($emoticon.'/package.json') == true) {
		$package = json_decode(file_get_contents($emoticon.'/package.json'));
		if ($package == null) continue;
		
		$package->category = array_pop(explode('/',$emoticon));
		$emoticons[] = $package;
	}
}
sort($emoticons);

$results->success = true;
$results->emoticons = $emoticons;
?>