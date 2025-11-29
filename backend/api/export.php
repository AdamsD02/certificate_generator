<?php 
session_start();

// get resources 
require_once __DIR__ . '/../lib/dompdf/autoload.inc.php';

use Dompdf\Dompdf;
use Dompdf\Options;

try {
    if(isset($_POST['action']))
} catch (\Throwable $th) {
    //throw $th;
}
?>