function test(input){
    input += 1;
    console.log(input);
}

function init(){
    /* Initalize a THREE.js scene, create camera, light, and renderer */
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0,init_height,0);
    // var camera_group = new THREE.Group();
    // camera_group.add(camera);
    // scene.add(camera_group);
    var light = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(light);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener("keydown", onKeyboardEvent, false);
    window.addEventListener('resize', onWindowResize, false);

    /* Used for debug */
    // orbit = new THREE.OrbitControls(camera, renderer.domElement);
    // orbit.addEventListener( 'change', render )
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
    console.log("camera", camera.position);
    if (window.isFinishedLoading){
        if (window.walk){
            //navigation method == walk
            var obj = scene.getObjectByName("landscape",true);
            var camera_pos = camera.position;
            var yVector = new THREE.Vector3(0,-1,0);
            var camera_vertical_ray = new THREE.Raycaster(camera_pos, yVector);
            var intersects = camera_vertical_ray.intersectObject(obj, true);
            if (intersects.length > 0){
                console.log("has landing");
                console.log(intersects[0]);
                if (intersects[0].distance > camera_height*2){
                    //falling
                    console.log("falling",camera_pos.y-velocity);
                    velocity += acceleration;
                    camera.position.set(camera_pos.x, camera_pos.y-velocity, camera_pos.z);
                } else {
                    velocity = 0;
                    var groud_height = intersects[0].point.y;
                    //var groud_normal = intersects[0].face.normal;
                    //console.log("normal", groud_normal);
                    camera.position.set(camera_pos.x, groud_height+camera_height, camera_pos.z);
                }
            } else {
                // fall off;
                falloff();
            }
        } else if (window.crawl){
            var obj = scene.getObjectByName("landscape",true);
            var camera_pos = camera.position;
            var yVector = new THREE.Vector3(0,-1,0);
            var camera_vertical_ray = new THREE.Raycaster(camera_pos, yVector);
            var intersects = camera_vertical_ray.intersectObject(obj, true);
            console.log("intersets", intersects);
            if (intersects.length>0){
                document.getElementsByClassName("instructions")[0].style.display="none";
                if (intersects[0].distance > camera_height*2){
                    //falling
                    //console.log("falling",camera_pos.y-velocity);
                    velocity += acceleration;
                    camera.position.set(camera_pos.x, camera_pos.y-velocity, camera_pos.z);
                } else {
                    velocity = 0;
                    var ground_height = intersects[0].point.y;
                    var ground_normal = intersects[0].face.normal;
                    //console.log("normal", groud_normal);
                    //var rotation = new THREE.Euler();
                    //var zVector = new THREE.Vector3(0,0,-1);
                    var ground_normal_z = new THREE.Vector3(0,1,ground_normal.z);
                    var ground_normal_x = new THREE.Vector3(ground_normal.x,1,0);
                    var zRotation = ground_normal.angleTo(ground_normal_z);
                    var xRotation = ground_normal.angleTo(ground_normal_x);
                    console.log("Rotation", xRotation, zRotation);
                    //rotation.setFromVector3(ground_normal);
                    //zVector.applyEuler(rotation);

                    camera.rotation.set(xRotation, camera.rotation.y, zRotation);
                    camera.position.set(camera_pos.x, ground_height+camera_height, camera_pos.z);
                    var camera_dir = new THREE.Vector3();
                    camera.getWorldDirection(camera_dir);
                    console.log("camera dir", camera_dir);
                    //console.log("normal",zVector, "euler", rotation);

                }
            } else {
                // fall off;
                falloff();
            }            
        } else if (window.jump){
            var obj = scene.getObjectByName("landscape",true);
            var camera_pos = camera.position;
            var yVector = new THREE.Vector3(0,-1,0);
            var camera_vertical_ray = new THREE.Raycaster(camera_pos, yVector);
            var intersects = camera_vertical_ray.intersectObject(obj, true);
            //console.log("intersets", intersects);
            if (intersects.length>0){
                if (intersects[0].distance > camera_height*2){

                }
                if (intersects[0].distance > camera_height*2 && !isJumping){
                    //falling
                    //console.log("falling",camera_pos.y-velocity);
                    velocity -= acceleration;
                    console.log(velocity);
                    camera.position.set(camera_pos.x, camera_pos.y+velocity, camera_pos.z);
                } 
                if (window.isJumping){
                    // jumping
                    jumping();
                } 
            } else {
                // fall off;
                falloff();
            }
        }
    }
}

function falloff(){
    velocity -= acceleration;
    camera.position.y = camera.position.y + velocity;
    //console.log("falloff", camera.position.y, velocity, acceleration);
    document.getElementsByClassName("instructions")[0].style.display="block";
    if (camera.position.y <= gameover_height){
        //gameover, switch scene
        var next_scene = jump_to_random_scene(0);
        location.href = next_scene;
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
                object.name="landscape";
                scene.add( object );
                console.log(object);
                window.isFinishedLoading = true;
                document.getElementsByClassName("instructions")[0].style.display="none";
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
    loader.load( plypath, function ( geometry ) {
        geometry.computeVertexNormals();
        geometry.center();
        var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors } );
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
        console.log(mesh);
        mesh.name="landscape";
        scene.add( mesh );
        window.isFinishedLoading = true;
        document.getElementsByClassName("instructions")[0].style.display="none";
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
    //console.log(scene);
}

function onKeyboardEvent(e){
    /* Control method */
    var blocked = false;
    var camera_dir = new THREE.Vector3();
    camera.getWorldDirection(camera_dir);

    if (window.walk){
        //console.log("move", moving_speed*camera_dir.z, moving_speed*camera_dir.x);
        var camera_pos = camera.position;
        var camera_dir_ray = new THREE.Raycaster(camera_pos, camera_dir);
        var obj = scene.getObjectByName("landscape",true);
        var intersects = camera_dir_ray.intersectObject(obj, true);
        if (intersects.length>0){
            console.log(intersects[0].distance);
            if (intersects[0].distance <= collision_margin){
                console.log("detect collide");
                blocked = true;
            }
        }
    }

    switch (e.code){
        case "ArrowLeft":
            camera.rotation.y += rotating_speed;
            break;
        case "ArrowRight":
            camera.rotation.y -= rotating_speed;
            break;
    }

    if (window.explodable){
        if (e.code == "KeyE"){
            explode("landscape");
        }
    }

    if (window.walk || window.crawl){
        switch (e.code){
            case "ArrowUp":
                console.log("arrowup", blocked);
                if (!blocked){
                    camera.position.z += moving_speed*camera_dir.z;
                    camera.position.x += moving_speed*camera_dir.x;
                }
                break;
            case "ArrowDown":
                camera.position.z -= moving_speed*camera_dir.z;
                camera.position.x -= moving_speed*camera_dir.x;
                break;
        }
    } else if (window.jump){
        console.log("jump");
        if (e.code =="Space"){
            if (!window.isJumping){
                velocity = 3;
                window.isJumping = true;
            }
        }

        if (window.isJumping){
            console.log(e.code);
            switch (e.code){
                case "ArrowUp":
                    console.log("forward");
                    if (!blocked){
                        window.isForwarding = true;
                    }
                    break;
                case "ArrowDown":
                    window.isBackwarding = true;
                    break;
            }
        }
    }
}

function jumping(){
    var camera_pos = camera.position;
    // var camera_dir_ray = new THREE.Raycaster(camera_pos, camera_dir);
    var obj = scene.getObjectByName("landscape",true);
    var yVector = new THREE.Vector3(0,-1,0);
    var camera_vertical_ray = new THREE.Raycaster(camera_pos, yVector)
    var intersects = camera_vertical_ray.intersectObject(obj, true);
    var camera_dir = new THREE.Vector3();
    camera.getWorldDirection(camera_dir);
    if (intersects.length>0){
        var ground_height = intersects[0].point.y;
        //console.log("jumping",intersects[0].distance, ground_height+camera_height, velocity);
        if (intersects[0].distance >= camera_height*2 || velocity >= 0){
            camera.position.y = camera_pos.y + velocity;
            velocity -= acceleration;
            if (window.isForwarding){
                camera.position.z += moving_speed/2*camera_dir.z;
                camera.position.x += moving_speed/2*camera_dir.x;
            } else if (window.isBackwarding){
                camera.position.z -= moving_speed/2*camera_dir.z;
                camera.position.x -= moving_speed/2*camera_dir.x;                
            }
        } else {
            console.log("www");
            velocity = 0;
            isJumping = false;
            isForwarding = false;
            camera.position.y = ground_height + camera_height;
        }
    }
}

function onWindowResize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
}

function jump_to_random_scene(i){
    var num_of_scenes = 4;
    var key = getRandomInt(1,num_of_scenes+1);
    while (key == i){
        key = getRandomInt(1,num_of_scenes+1);
    }
    return "scene_"+key+".html";
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }