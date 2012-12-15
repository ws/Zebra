<?php
if (!isset($_GET['code']))
	die(json_encode(Array('error' => 'No ZIP code defined.', 'results' => Array())));

if (!isset($_GET['country']))
	die(json_encode(Array('error' => 'No country defined.', 'results' => Array())));

$zip = $_GET['code'];
$country = $_GET['country'];
$zipData = Array();

switch ($country) {
	case 'DO':
		$rows = explode("\n", file_get_contents("data/do-zips.csv"));
		
		foreach ($rows as $row) {
			$values = str_getcsv($row);
			
			if ($values[2] == $zip)
				$zipData = Array(
					'zip' => $values[2],
					'state' => $values[1],
					'city' => $values[0],
				);
		}
		
		if (count($zipData) !== 0)
			echo json_encode(Array('results' => $zipData));
		else 
			die(json_encode(Array('error' => 'No results found.', 'results' => Array())));
		break;
	case 'US':
		$rows = explode("\n", file_get_contents("data/us-zips.csv"));
		
		foreach ($rows as $row) {
			$values = str_getcsv($row);
			
			if ($values[0] == $zip)
				$zipData = Array(
					'zip' => $values[0],
					'state' => $values[1],
					'city' => $values[2],
				);
		}
		
		if (count($zipData) !== 0)
			echo json_encode(Array('results' => $zipData));
		else 
			die(json_encode(Array('error' => 'No results found.', 'results' => Array())));
		break;
	case 'GB':
		$rows = explode("\n", file_get_contents("data/uk-zips.csv"));
		
		$area = str_replace(" ", "", $zip);
		if (strlen($area) < 5 || strlen($area) > 7)
			die(json_encode(Array('error' => 'Invalid postcode.', 'results' => Array())));
		
		$area = substr($area, 0, -3);
		
		foreach ($rows as $row) {
			$values = str_getcsv($row);
				
			if ($values[0] == $area)
				$zipData = Array(
					'zip' => $values[0],
					'city' => $values[1],
					'state' => $values[2],
					'country' => $values[3]
				);
		}
		
		if (count($zipData) !== 0)
			echo json_encode(Array('results' => $zipData));
		else 
			die(json_encode(Array('error' => 'No results found.', 'results' => Array())));
		break;
	default:
		die(json_encode(Array('error' => 'Country not supported', 'results' => Array())));
}