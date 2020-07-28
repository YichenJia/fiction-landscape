function test(input){
    input += 1;
    console.log(input);
}

function init(){
    /* Initalize a THREE.js scene, create camera, light, and renderer */
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var light = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(light);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener("keydown", onKeyboardEvent, false);
    window.addEventListener('resize', onWindowResize, false);

    /* Used for debug */
    // orbit = new THREE.OrbitControls(camera, renderer.domElement);
    // orbit.addEventListener( 'change', render );
    
}

function animate() {
    requestAnimationFrame( animate );
    render();
    if (camera.position.x == 0 && camera.position.y == 0 && camera.position.z == -10){
        var audio = document.getElementById("my_audio");
        if (audio){
            // console.log("audio",audio.paused, audio.currentTime);
            if (audio.currentTime == 0){
                console.log("trigger audio");
                document.getElementById("my_audio").play();
            }
        }
    }
}

function render(){
    renderer.render(scene, camera);
}

function load_model(dirpath, objpath, mtlpath){
    /* Load model from OBJ and MTL file into the scene */
    var loader = new THREE.OBJLoader();
    new THREE.MTLLoader()
    .setPath(dirpath)
    .load(mtlpath, function (materials) {
        materials.preload();
        loader.setMaterials(materials);
        loader.setPath(dirpath);
        loader.load(objpath,
            // called when resource is loaded
            function ( object ) {
                //var texture = new THREE.TextureLoader().load(texturepath[0]);
                // object.traverse(function (child) {
                //     if (child instanceof THREE.Mesh) {
                //         child.material.map = texture;
                //         child.material.side = THREE.DoubleSide;
                //     }
                // });
                // let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.25 })
                // mesh = new THREE.Points(object.children[0].geometry, material)
                object.name="landscape";
                scene.add( object );
                console.log(object);
            },
            // called when loading is in progresses
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened' );
            }
        );
    });
}

function explode(objname){
    var obj = scene.getObjectByName(objname,true);
    console.log("to be exploded", obj);
    for (var i in obj.children){
        console.log(obj.children[i].position);
        var limit = 100;
        //var move = new THREE.Vector3(Math.random()*limit, Math.random()*limit, Math.random()*limit);
        obj.children[i].position.set(Math.random()*limit, Math.random()*limit, Math.random()*limit);
    }
    console.log("exploded", obj);
}

function load_point_cloud(plypath){
    var loader = new THREE.PLYLoader();
    loader.load( '/assets/models/test.ply', function ( geometry ) {
        geometry.computeVertexNormals();
        geometry.center();
        var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors } );
        //var material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.y = - 0.2;
        mesh.position.z = 0.3;
        mesh.rotation.x = - Math.PI / 2;
        var pointMaterial = new THREE.PointsMaterial({
            vertexColors: THREE.VertexColors,
            size:2,
            sizeAttenuation: false,
        })
        mesh = new THREE.Points(geometry, pointMaterial);
        //mesh.scale.multiplyScalar( 100 );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        var box = new THREE.BoxHelper( mesh, 0xffff00 );
        console.log(mesh);
        scene.add( box );
        scene.add( mesh );
    },            
    // called when loading is in progresses
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    } );
}

function draw_sphere(coord, color){
    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial({color: 0xffff00});
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(coord);
    scene.add( sphere );
    console.log(scene);
}

function onKeyboardEvent(e){
    /* Control method */
    //navigation method 2: floating
    if(e.code ==='ArrowUp'){
        console.log("arrowup");
        camera.position.z -= 1;
    } else if (e.code === "ArrowDown"){
        camera.position.z += 1;        
    } else if (e.code === 'ArrowLeft'){
        camera.position.x -= 1;
    } else if (e.code === 'ArrowRight'){
        camera.position.x += 1;
    } else if (e.code === 'KeyE'){
        explode("landscape");
    }
    console.log("camera", camera.position);
}

function onWindowResize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
}