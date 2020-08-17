<!DOCTYPE html>
<html>
<body>

<h1>My first PHP page</h1>

<?php
echo "Hello World!";

$m = new MongoClient();
	
echo "Connection to database successfully";

// select a database
$db = $m->trace;
	
echo $db;
echo "Database trace selected";

?>

</body>
</html>