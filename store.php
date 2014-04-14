 <?php 
	if(array_key_exists('action',$_POST) && $_POST['action'] == "boidData"){
		$file = "savedBoids.txt";
		$data = $_POST['data'];
	    $random = substr( md5(rand()), 0, 7);
		$jsonArry = null;
		if(file_exists($file)){
			$jsonArry = json_decode(file_get_contents($file),true);
		}else{
		    $jsonArry = array();
		}
		$jsonArry[$random] = $data;
		file_put_contents($file, json_encode($jsonArry));
		echo $random;
	}
	if(array_key_exists('action',$_GET) && $_GET['action'] == "loadBoid"){
	    $file = "savedBoids.txt";
		$data = "";
	    $id = $_GET['id'];
	   	$jsonArry = null;
		if(file_exists($file)){
			$jsonArry = json_decode(file_get_contents($file),true);
		}else{
		    $jsonArry = array();
		}
		if(array_key_exists($id,$jsonArry)){
			$data = $jsonArry[$id];
		}else{
			header('HTTP/1.1 500 Internal Server Error');
			header('Content-Type: application/json; charset=UTF-8');
			die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
		}
		echo $data;
	}
?>
