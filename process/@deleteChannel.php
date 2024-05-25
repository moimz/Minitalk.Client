<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널을 삭제한다.
 * 
 * @file /process/@deleteChannel.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @modified 2024. 5. 25.
 */
if (defined('__MINITALK__') == false) exit;

$channels = Param('channels') ? json_decode(Request('channels')) : array();
if (is_array($channels) == true && count($channels) > 0) {
    foreach ($channels as $channel) {
        $this->db()->delete($this->table->channel)->where('channel',(string)$channel)->execute();
    }
}

$results->success = true;
?>