<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 첨부파일을 삭제한다.
 * 
 * @file /process/@deleteAttachment.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.0
 * @modified 2021. 6. 3.
 */
if (defined('__MINITALK__') == false) exit;

$hashes = Request('hashes') ? json_decode(Request('hashes')) : null;
$mode = Request('mode') ? Request('mode') : null;

$lists = array();
if ($hashes != null && is_array($hashes) == true && count($hashes) > 0) {
	$lists = $this->db()->select($this->table->attachment)->where('hash',$hashes,'IN')->get();
} elseif ($mode == 'expired') {
	$lists = $this->db()->select($this->table->attachment)->where('exp_date',0,'>')->where('exp_date',time(),'<')->get();
}

for ($i=0, $loop=count($lists);$i<$loop;$i++) {
	@unlink($this->getAttachmentPath().'/'.$lists[$i]->path);
	
	$this->db()->delete($this->table->attachment)->where('hash',$lists[$i]->hash)->execute();
}

$results->success = true;
?>