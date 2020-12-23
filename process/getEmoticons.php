<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 이모티콘 폴더를 읽어, 이모티콘 그룹을 가져온다.
 * 
 * @file /process/getEmoticons.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 8. 23.
 */
if (defined('__MINITALK__') == false) exit;

$emoticons = array();
$emoticonsPath = @opendir(__MINITALK_PATH__.'/emoticons');
while ($emoticonName = @readdir($emoticonsPath)) {
	if ($emoticonName != '.' && $emoticonName != '..' && is_dir(__MINITALK_PATH__.'/emoticons/'.$emoticonName) == true && is_file(__MINITALK_PATH__.'/emoticons/'.$emoticonName.'/package.json') == true) {
		$package = json_decode(file_get_contents(__MINITALK_PATH__.'/emoticons/'.$emoticonName.'/package.json'));
		if ($package == null) continue;
		
		$package->category = $emoticonName;
		$emoticons[] = $package;
	}
}
sort($emoticons);

$results->success = true;
$results->emoticons = $emoticons;
?>