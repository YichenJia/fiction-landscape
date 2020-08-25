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

    listener = new THREE.AudioListener();
    camera.add( listener );

    controls = new THREE.PointerLockControls( camera, document.body );

    window.addEventListener("keydown", onKeyboardEvent, false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', function () {
        if (!controls.isLocked){
            window.cameraRotBeforeLock = {"x":camera.rotation.x, "y":camera.rotation.y,"z":camera.rotation.z};
        }
        controls.lock();
    }, false );

    controls.addEventListener('lock',function(){
        console.log("lock",window.cameraRotBeforeLock);
    })

    controls.addEventListener('unlock',function(){
        window.crawl? camera.rotation.x = window.cameraRotBeforeLock.x : camera.rotation.x = 0;
        camera.rotation.y = window.cameraRotBeforeLock.y;
        window.crawl? camera.rotation.z = window.cameraRotBeforeLock.z : camera.rotation.z = 0;
        console.log("unlock",camera.rotation);
    })
    // window.addEventListener('mousemove',function(){
    //     if (controls.isLocked){
    //         console.log(camera.rotation);
    //     }
    // })
    //window.addEventListener("mouse", onKeyboardEvent, false);

    /* Used for debug */
    // orbit = new THREE.OrbitControls(camera, renderer.domElement);
    // orbit.addEventListener( 'change', render )
}

function animate() {
    requestAnimationFrame( animate );
    render();

    //console.log("velocity",window.velocity);
    //console.log("camera pos", camera.position);
    if (!window.isFinishedLoading){
        document.getElementsByClassName("instructions")[0].style.display="block";
    } else if ((window.velocity <= -0.3 || window.velocity > 0.1 ) && !window.isJumping){
        //console.log(window.velocity);
        document.getElementsByClassName("instructions")[0].style.display="block";
    } else {
        document.getElementsByClassName("instructions")[0].style.display="none"
    }
    if (window.isJumping){
        //console.log(window.isJumping);
        if (document.getElementsByClassName("instructions-jumping")[0]){
            document.getElementsByClassName("instructions-jumping")[0].style.display="block";
        }
    } else {
        if (document.getElementsByClassName("instructions-jumping")[0]){
            document.getElementsByClassName("instructions-jumping")[0].style.display="none";
        }
    }

    //console.log("camera", camera.position);
    if (window.isFinishedLoading){
        if (window.walk){
            //navigation method == walk
            var obj = scene.getObjectByName("landscape",true);
            var camera_pos = camera.position;
            var yVector = new THREE.Vector3(0,-1,0);
            var camera_vertical_ray = new THREE.Raycaster(camera_pos, yVector);
            var intersects = camera_vertical_ray.intersectObject(obj, true);
            if (intersects.length > 0){
                //console.log("has landing");
                //console.log(intersects[0]);
                if (intersects[0].distance > camera_height*2){
                    //falling
                    //console.log("falling",camera_pos.y-velocity);
                    velocity += acceleration;
                    camera.position.set(camera_pos.x, camera_pos.y-velocity, camera_pos.z);
                } else {
                    velocity = 0;
                    var ground_height = intersects[0].point.y;
                    //var groud_normal = intersects[0].face.normal;
                    //console.log("normal", groud_normal);
                    camera.position.set(camera_pos.x, ground_height+camera_height, camera_pos.z);
                    document.getElementsByClassName("instructions")[0].style.display="none";
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
            //console.log("intersets", intersects);
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

                    var ground_normal_z = new THREE.Vector3(0,1,ground_normal.z);
                    var ground_normal_x = new THREE.Vector3(ground_normal.x,1,0);
                    var zRotation = ground_normal.angleTo(ground_normal_z);
                    var xRotation = ground_normal.angleTo(ground_normal_x);

                    camera.rotation.set(xRotation, camera.rotation.y, zRotation);
                    camera.position.set(camera_pos.x, ground_height+camera_height, camera_pos.z);
                    var camera_dir = new THREE.Vector3();
                    camera.getWorldDirection(camera_dir);

                }
            } else {
                falloff();
            }            
        } else if (window.jump){
            var obj = scene.getObjectByName("landscape",true);
            var camera_pos = camera.position;
            var yVector = new THREE.Vector3(0,-1,0);
            var camera_vertical_ray = new THREE.Raycaster(camera_pos, yVector);
            var intersects = camera_vertical_ray.intersectObject(obj, true);
            if (intersects.length>0){
                if (intersects[0].distance > camera_height*2){

                }
                if (intersects[0].distance > camera_height*2 && !isJumping){
                    //falling
                    velocity -= acceleration;
                    camera.position.set(camera_pos.x, camera_pos.y+velocity, camera_pos.z);
                }
                if (window.isJumping){
                    jumping();
                } 
            } else {
                falloff();
            }
        }
    }
}

function falloff(){
    velocity -= acceleration;
    camera.position.y = camera.position.y + velocity;
    //console.log("falloff", camera.position.y, velocity, acceleration);
    if (camera.position.y <= gameover_height){
        //gameover, switch scene
        var next_scene = jump_to_random_scene();
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
                //console.log(object);
                window.isFinishedLoading = true;
                //document.getElementsByClassName("instructions")[0].style.display="none";
                loadTrace();

                // load skybox if there is one
                if (window.skybox_file){
                    console.log("load skybox");
                    var tloader = new THREE.TextureLoader();
                    var skybox = tloader.load(
                        window.skybox_file,
                        ()=>{
                            const rt = new THREE.WebGLCubeRenderTarget(skybox.image.height);
                            rt.fromEquirectangularTexture(renderer,skybox);
                            scene.background = rt;
                        })
                }
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
    //console.log("to be exploded", obj);
    console.log(obj, obj.children);
    var limit = 100;
    if (obj.children.length){
        for (var i in obj.children){
            //console.log(obj.children[i].position);
            //var move = new THREE.Vector3(Math.random()*limit, Math.random()*limit, Math.random()*limit);
            obj.children[i].position.set(Math.random()*limit, Math.random()*limit, Math.random()*limit);
        }
    } else {
        console.log(Math.random()*limit, Math.random()*limit, Math.random()*limit);
        obj.position.set(Math.random()*limit, Math.random()*limit, Math.random()*limit);
        console.log(obj.position);
    }
    console.log("exploded", obj);
}

function load_point_cloud(plypath){
    var loader = new THREE.PLYLoader();
    var point_size = 2;
    //var sizes = new Float32Array( amount );

    loader.load( plypath, function ( geometry ) {
        geometry.computeVertexNormals();
        geometry.center();
        var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors } );
        //var mesh = new THREE.Mesh( geometry, material );

        // var sizes = new Float32Array( vertices.length );
        var sizes = new Float32Array( geometry.attributes.position.count );
        for ( var i = 0, l = geometry.attributes.position.count; i < l; i ++ ) {
            sizes[ i ] = point_size * 0.5;
        }
        geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

        console.log(geometry);
        // mesh.position.y = - 0.2;
        // mesh.position.z = 0.3;
        // mesh.rotation.x = - Math.PI / 2;

        var pointMaterial = new THREE.PointsMaterial({
            vertexColors: THREE.VertexColors,
            size:point_size,
            sizeAttenuation: false,
        })


        var mesh = new THREE.Points(geometry, pointMaterial);
        //mesh.scale.multiplyScalar( 100 );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //console.log(mesh);
        mesh.name="landscape";
        mesh.position.set(10,0,10);
        scene.add( mesh );
        window.isFinishedLoading = true;
        //document.getElementsByClassName("instructions")[0].style.display="none";
        loadTrace();
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
    if (controls.isLocked){
        //console.log("rot before lock",window.cameraRotBeforeLock)
        controls.unlock();
    }
    //console.log(camera.rotation);
    //console.log(camera_group.rotation);

    if (!window.active){
        if (window.play_on_load_file){
            play_audio(window.play_on_load_file);
        }
        else if (window.play_on_load_positional_file){
            play_positional_audio(window.play_on_load_positional_file, window.audiopos, window.audioradius);
        }
        else if (window.play_on_load_dir){
            play_multiple_positional_audio(window.play_on_load_dir, window.audiopos,window.audiosuffix);
        }
        window.active = true;
    }

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
            //console.log(intersects[0].distance);
            if (intersects[0].distance <= collision_margin){
                console.log("detect collide");
                blocked = true;
            }
        }
    }

    switch (e.code){
        case "ArrowLeft":
        case "KeyA":
            camera.rotation.y += rotating_speed;
            break;
        case "ArrowRight":
        case "KeyD":
            camera.rotation.y -= rotating_speed;
            break;
    }

    if (window.explodable){
        if (e.code == "KeyE"){
            console.log("explode");
            explode("landscape");
        }
    }

    // if (e.code == "KeyC"){//helper function
    //     clearTrace();
    // }
    // if (e.code == "KeyL"){
    //     loadTrace();
    // }

    if (window.walk || window.crawl){
        switch (e.code){
            case "ArrowUp":
            case "KeyW":
                //console.log("arrowup", blocked);
                //controls.disconnect();
                if (!blocked){
                    camera.position.z += moving_speed*camera_dir.z;
                    camera.position.x += moving_speed*camera_dir.x;
                }
                //controls.connect();
                break;
            case "ArrowDown":
            case "KeyS":
                //controls.disconnect();
                camera.position.z -= moving_speed*camera_dir.z;
                camera.position.x -= moving_speed*camera_dir.x;
                //controls.connect();
                break;
        }
    } else if (window.jump){
        if (!window.isJumping){
            switch (e.code){
                case "Space":
                    var pos_x = Math.round(camera.position.x*10)/10; //round position value to reduce data size
                    var pos_y = Math.round(camera.position.y*10)/10;
                    var pos_z = Math.round(camera.position.z*10)/10;

                    if (trace_data.length == 0 && trace_data[trace_data.length-3]==pos_x && trace_data[trace_data.length-2]==pos_y && trace_data[trace_data.length-1]==pos_z){
                        //pass
                    } else {
                        trace_data.push(pos_x);
                        trace_data.push(pos_y);
                        trace_data.push(pos_z);
                    }
                    // trace_data.push(Math.round(camera.position.x*10)/10);
                    // trace_data.push(Math.round(camera.position.y*10)/10);
                    // trace_data.push(Math.round(camera.position.z*10)/10);
                    console.log("add jump", trace_data);
                    velocity = 3;
                    window.isJumping = true;

                    if (window.play_on_trigger_dir){
                        play_random_audio(window.play_on_trigger_dir, window.audio_n);
                    }
                    break;
                case "ArrowUp":
                case "KeyW":
                    console.log("record forward");
                    if (!blocked){
                        camera.position.z += moving_speed/10*camera_dir.z;
                        camera.position.x += moving_speed/10*camera_dir.x;

                        var pos_x = Math.round(camera.position.x*10)/10; //round position value to reduce data size
                        var pos_y = Math.round(camera.position.y*10)/10;
                        var pos_z = Math.round(camera.position.z*10)/10;

                        if (trace_data.length == 0 && trace_data[trace_data.length-3]==pos_x && trace_data[trace_data.length-2]==pos_y && trace_data[trace_data.length-1]==pos_z){
                            //pass
                        } else {
                            trace_data.push("l"+pos_x);
                            trace_data.push("l"+pos_y);
                            trace_data.push("l"+pos_z);
                        }
                    }
                    break;
                case "ArrowDown":
                case "KeyS":
                    console.log("record forward");
                    camera.position.z -= moving_speed/10*camera_dir.z;
                    camera.position.x -= moving_speed/10*camera_dir.x;

                    var pos_x = Math.round(camera.position.x*10)/10; //round position value to reduce data size
                    var pos_y = Math.round(camera.position.y*10)/10;
                    var pos_z = Math.round(camera.position.z*10)/10;

                    if (trace_data.length == 0 && trace_data[trace_data.length-3]==pos_x && trace_data[trace_data.length-2]==pos_y && trace_data[trace_data.length-1]==pos_z){
                        //pass
                    } else {
                        trace_data.push("l"+pos_x);
                        trace_data.push("l"+pos_y);
                        trace_data.push("l"+pos_z);
                    }

                    break;
            }
        } else {
            switch (e.code){
                case "ArrowUp":
                case "KeyW":
                    //console.log("forward");
                    if (!blocked){
                        window.isForwarding = true;
                    }
                    break;
                case "ArrowDown":
                case "KeyS":
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

function jump_to_random_scene(){
    var num_of_scenes = 9;
    var key = getRandomInt(1,num_of_scenes+1);
    while (key == window.sceneIndex){
        key = getRandomInt(1,num_of_scenes+1);
    }
    return "scene_"+key;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function record(){
    var location_data=[];

    if (!document.hidden) {
    // do what you need
        if (window.walk || window.crawl){
            setInterval(function(){
                //console.log("location_data", location_data);
                var pos_x = Math.round(camera.position.x*10)/10; //round position value to reduce data size
                var pos_y = Math.round(camera.position.y*10)/10;
                var pos_z = Math.round(camera.position.z*10)/10;
                if (location_data.length >=3 && pos_x == location_data[location_data.length - 3] && pos_y == location_data[location_data.length - 2] && pos_z == location_data[location_data.length-1]){
                    //user did not move, therefore no location being logged
                    //console.log("not moving");
                } else {
                    location_data.push(Math.round(camera.position.x*10)/10); 
                    location_data.push(Math.round(camera.position.y*10)/10);
                    location_data.push(Math.round(camera.position.z*10)/10);
                }
                //console.log(location_data);
                if (location_data.length >= 60){ //post location data every 10 secs
                    console.log("post location data");

                    var today = new Date();
                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var dateTime = date+' '+time;

                    var dataPost = {
                        scene: window.sceneIndex,
                        path: location_data.join(","),
                        timestamp:dateTime
                    }

                    var dataString = JSON.stringify(dataPost);
                    console.log(dataString);

                    $.ajax({
                      type: "POST",
                      url: "/newtrace",
                      dataType: 'json',
                      data: {myData: dataString},
                      success: function(data){
                        console.log("posted", data);
                      },
                      error: function(err){
                        console.log("error", err.responseText);
                      }
                    });

                    location_data = location_data.slice(location_data.length-3,location_data.length);

                }
            }, 500);

        } else if (window.jump){
            setInterval(function(){
                if (trace_data.length >= 30){ 
                    console.log("post location data");

                    var today = new Date();
                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var dateTime = date+' '+time;

                    var dataPost = {
                        scene: window.sceneIndex,
                        path: trace_data.join(","),
                        timestamp:dateTime
                    }

                    var dataString = JSON.stringify(dataPost);
                    console.log(dataString);

                    $.ajax({
                      type: "POST",
                      url: "/newtrace",
                      dataType: 'json',
                      data: {myData: dataString},
                      success: function(data){
                        console.log("posted", data);
                      },
                      error: function(err){
                        console.log("error", err.responseText);
                      }
                    });

                    trace_data = trace_data.slice(trace_data.length-3,trace_data.length);
                }
                //trace_data = []; //empty trace_data

            }, 5000); //check if data is long enough to be posted every 5 secs
        }
    }
}

function loadTrace(){
    //console.log("load trace", db_paths);

    if (db_paths){
        for (var i = 0; i < db_paths.length; i++){
            if (i >= db_paths.length-1000){
                var path = db_paths[i]["path"];
                var color = randomColor(100);
                var path_array = path.split(",");
                if (window.pointCloud){
                    paint_point_trace(path_array);
                } else if (window.walk || window.crawl){
                    paint_line_trace(path_array, color);
                } else if (window.jump){
                    paint_line_and_curve_trace(path_array, color);
                    //paint_curve_trace(path_array, color);
                }  
            }          
        }
    }
}

function paint_line_and_curve_trace(path_array, color){
    //console.log("paint_line_and_curve_trace",path_array);
    var trace = new THREE.Group();
    trace.name = "trace";
    for(var i=1; i<path_array.length/3-1; i++){
        //console.log("draw",path_array.slice(i*3-3, i*3+3));
        if (path_array[i*3-3][0] == "l"){
            //console.log("draw line");
            var points = [];
            var pos_x1 = parseFloat(path_array[i*3-3].substring(1));
            var pos_y1 = parseFloat(path_array[i*3-2].substring(1))-camera_height/2; 
            var pos_z1 = parseFloat(path_array[i*3-1].substring(1));

            if (path_array[i*3][0] == "l"){
                var pos_x2 = parseFloat(path_array[i*3].substring(1));
                var pos_y2 = parseFloat(path_array[i*3+1].substring(1))-camera_height/2; 
                var pos_z2 = parseFloat(path_array[i*3+2].substring(1));
            } else {
                var pos_x2 = parseFloat(path_array[i*3]);
                var pos_y2 = parseFloat(path_array[i*3+1])-camera_height/2; 
                var pos_z2 = parseFloat(path_array[i*3+2]);
            }

            //if (pos_x1 != pos_x2)
            points.push (new THREE.Vector3(pos_x1, pos_y1, pos_z1));
            points.push (new THREE.Vector3(pos_x2, pos_y2, pos_z2));
            //console.log("points",points);

            var geometry = new THREE.BufferGeometry().setFromPoints( points );
            //console.log("geo",geometry);
            var material = new THREE.LineBasicMaterial( { color: new THREE.Color(color)});

            var line = new THREE.Line( geometry, material );
            //console.log("line",line);
            trace.add(line);
        } else {
            //console.log("draw curve");
            var pos_x1 = parseFloat(path_array[i*3-3]);
            var pos_y1 = parseFloat(path_array[i*3-2])-camera_height/2; 
            var pos_z1 = parseFloat(path_array[i*3-1]);

            if (path_array[i*3][0] == "l"){
                var pos_x2 = parseFloat(path_array[i*3].substring(1));
                var pos_y2 = parseFloat(path_array[i*3+1].substring(1))-camera_height/2; 
                var pos_z2 = parseFloat(path_array[i*3+2].substring(1));
            } else {
                var pos_x2 = parseFloat(path_array[i*3]);
                var pos_y2 = parseFloat(path_array[i*3+1])-camera_height/2; 
                var pos_z2 = parseFloat(path_array[i*3+2]);
            }

            if (pos_x1 != pos_x2||pos_z1 != pos_z2){
                var curve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3( pos_x1, pos_y1, pos_z1 ), //start
                    new THREE.Vector3( (pos_x1+pos_x2)/2, pos_y1+50, (pos_z1+pos_z2)/2 ), //control point
                    new THREE.Vector3( pos_x2, pos_y2, pos_z2), //end
                );

                var points = curve.getPoints( 50 );
                //console.log("geo2",points);
                var geometry = new THREE.BufferGeometry().setFromPoints( points );
                var material = new THREE.LineBasicMaterial( { color: color } );
                var ellipse = new THREE.Line( geometry, material );

                //ellipse.position.set((pos_x1+pos_x2)/2, (pos_y1+pos_y2)/2, pos_z1);
                trace.add(ellipse);
            }
        }
    }
    scene.add(trace);
}

function paint_point_trace(path_array){
    //console.log("enlarge point", path_array);
    var points = [];
    var positions = [];
    var obj = scene.getObjectByName("landscape",true);
    var colors = obj.geometry.getAttribute("color").array;
    //console.log(obj, colors);

    var trace = new THREE.Group();
    trace.name = "trace";

    for(var i=0; i<path_array.length/3; i++){
        if (path_array[i*3][0] == "l"){
            var pos_x = parseFloat(path_array[i*3].substring(1));
            var pos_y = parseFloat(path_array[i*3+1].substring(1))-camera_height/2; 
            var pos_z = parseFloat(path_array[i*3+2].substring(1));
        } else {
            var pos_x = parseFloat(path_array[i*3]);
            var pos_y = parseFloat(path_array[i*3+1])-camera_height/2; 
            var pos_z = parseFloat(path_array[i*3+2]);
        }
        //points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) ); 
        //positions.push(pos_x, pos_y, pos_z);
        //console.log(pos_x, pos_y, pos_z);
        var camera_pos = new THREE.Vector3(pos_x, pos_y, pos_z);
        //console.log("camera_pos",camera_pos);
        var yVector = new THREE.Vector3(0,-1,0);
        var vertical_ray = new THREE.Raycaster(camera_pos, yVector);
        var intersects = vertical_ray.intersectObject(obj, true);
        if (intersects.length>0){
            var coord = intersects[0].point;
            var r = colors[intersects[0].index*3];
            var g = colors[intersects[0].index*3+1];
            var b = colors[intersects[0].index*3+2];
            var color = new THREE.Color(r,g,b);
            //console.log(coord, color);
            var pointGeo = new THREE.SphereGeometry( 0.25, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: color} );
            var sphere = new THREE.Mesh( pointGeo, material );
            sphere.position.set(coord.x, coord.y, coord.z);
            trace.add(sphere);
        }
    }
    scene.add(trace);
}

function paint_curve_trace(path_array, color){
    var points = [];
    var positions = [];
    var trace = new THREE.Group();
    trace.name = "trace";
    for(var i=0; i<path_array.length/3; i++){
        if (i != 0){
            var pos_x1 = parseFloat(path_array[i*3-3]);
            var pos_y1 = parseFloat(path_array[i*3-2])-camera_height/2; 
            var pos_z1 = parseFloat(path_array[i*3-1]);

            var pos_x2 = parseFloat(path_array[i*3]);
            var pos_y2 = parseFloat(path_array[i*3+1])-camera_height/2; 
            var pos_z2 = parseFloat(path_array[i*3+2]);

            if (pos_x1 != pos_x2||pos_z1 != pos_z2){
                var curve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3( pos_x1, pos_y1, pos_z1 ), //start
                    new THREE.Vector3( (pos_x1+pos_x2)/2, pos_y1+50, (pos_z1+pos_z2)/2 ), //control point
                    new THREE.Vector3( pos_x2, pos_y2, pos_z2), //end
                );

                var points = curve.getPoints( 50 );
                var geometry = new THREE.BufferGeometry().setFromPoints( points );
                var material = new THREE.LineBasicMaterial( { color: color } );
                var ellipse = new THREE.Line( geometry, material );

                //ellipse.position.set((pos_x1+pos_x2)/2, (pos_y1+pos_y2)/2, pos_z1);
                trace.add(ellipse);
            }
        }
    }
    scene.add(trace);
}

function randomColor(brightness){
    function randomChannel(brightness){
        var r = 255-brightness;
        var n = 0|((Math.random() * r) + brightness);
        var s = n.toString(16);
        return (s.length==1) ? '0'+s : s;
    }
    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
}

function paint_line_trace(path_array,color){
    //console.log("paint line", path_array);
    var points = [];
    var positions = [];
    for(var i=0; i<path_array.length/3; i++){
        var pos_x = parseFloat(path_array[i*3]);
        var pos_y = parseFloat(path_array[i*3+1])-camera_height/2; 
        var pos_z = parseFloat(path_array[i*3+2]);
        points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) ); 
        positions.push(pos_x, pos_y, pos_z);
    }
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color: new THREE.Color(color)});

    var line = new THREE.Line( geometry, material );

    var trace = scene.getObjectByName("trace");
    if (trace){
        trace.add(line);
    } else {
        trace = new THREE.Group();
        trace.name="trace"
        trace.add(line);
        scene.add(trace);
    }
}

function clearTrace(){
    console.log("clear trace");
    localStorage.clear();
    var trace = scene.getObjectByName("trace");
    if (trace){
        scene.remove(trace);
    }
}

function play_audio(filepath){
    // create a global audio source
    console.log("play audio", filepath);
    var background_sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( filepath, function( buffer ) {
        background_sound.setBuffer( buffer );
        background_sound.setLoop( true );
        background_sound.setVolume( 0.5 );
        background_sound.play();
    });
}

function play_positional_audio(filepath, coords, radius=50){
    var psound = new THREE.PositionalAudio( listener );

    // load a sound and set it as the PositionalAudio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( filepath, function( buffer ) {
        psound.setBuffer( buffer );
        psound.setLoop( true );
        psound.setDistanceModel("linear");
        psound.setRolloffFactor(1);
        psound.setRefDistance( 1 );
        psound.setMaxDistance(radius);
        psound.play();
    });

    // create an object for the sound to play from
    var sphere = new THREE.SphereBufferGeometry( 2, 32, 16 );
    var material = new THREE.MeshPhongMaterial( { color: 0xff2200 } );
    var mesh = new THREE.Mesh( sphere, material );
    mesh.position.set(coords.x, coords.y, coords.z);
    scene.add( mesh );

    // finally add the sound to the mesh
    mesh.add( psound );    
}

function play_random_audio(dirpath, n, suffix=".m4a"){
    console.log("play random audio", dirpath);
    var index = getRandomInt(0, n)
    // create a global audio source
    var sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( dirpath+"/"+index+suffix, function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( false );
        sound.setVolume( 0.5 );
        sound.play();
    });    
}

function play_multiple_positional_audio(dirpath, coords, suffix=".m4a"){
    // create the PositionalAudio object (passing in the listener)
    console.log("play positional audio", dirpath);
    coords.forEach(function(v,i){
        var sound = new THREE.PositionalAudio( listener );

        // load a sound and set it as the PositionalAudio object's buffer
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load( dirpath + "/" + i + suffix, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setDistanceModel("linear");
            sound.setRolloffFactor(1);
            sound.setRefDistance( 1 );
            sound.setMaxDistance(50);
            sound.play();
        });

        // create an object for the sound to play from
        var sphere = new THREE.SphereBufferGeometry( 2, 32, 16 );
        var material = new THREE.MeshPhongMaterial( { color: 0xff2200 } );
        var mesh = new THREE.Mesh( sphere, material );
        mesh.position.set(v.x, v.y, v.z);
        scene.add( mesh );

        // finally add the sound to the mesh
        mesh.add( sound );
    })
}