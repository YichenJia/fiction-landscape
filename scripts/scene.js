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
                    //console.log("normal", groud_normal);
                    //var rotation = new THREE.Euler();
                    //var zVector = new THREE.Vector3(0,0,-1);
                    var ground_normal_z = new THREE.Vector3(0,1,ground_normal.z);
                    var ground_normal_x = new THREE.Vector3(ground_normal.x,1,0);
                    var zRotation = ground_normal.angleTo(ground_normal_z);
                    var xRotation = ground_normal.angleTo(ground_normal_x);
                    //console.log("Rotation", xRotation, zRotation);
                    //rotation.setFromVector3(ground_normal);
                    //zVector.applyEuler(rotation);

                    camera.rotation.set(xRotation, camera.rotation.y, zRotation);
                    camera.position.set(camera_pos.x, ground_height+camera_height, camera_pos.z);
                    var camera_dir = new THREE.Vector3();
                    camera.getWorldDirection(camera_dir);
                    //console.log("camera dir", camera_dir);
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
                    //console.log(velocity);
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
    //console.log("to be exploded", obj);
    for (var i in obj.children){
        //console.log(obj.children[i].position);
        var limit = 100;
        //var move = new THREE.Vector3(Math.random()*limit, Math.random()*limit, Math.random()*limit);
        obj.children[i].position.set(Math.random()*limit, Math.random()*limit, Math.random()*limit);
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

        console.log(geometry);
        // var sizes = new Float32Array( vertices.length );
        var sizes = new Float32Array( geometry.attributes.position.count );
    geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

        // mesh.position.y = - 0.2;
        // mesh.position.z = 0.3;
        // mesh.rotation.x = - Math.PI / 2;
        var pointMaterial = new THREE.PointsMaterial({
            vertexColors: THREE.VertexColors,
            size:2,
            sizeAttenuation: false,
        })
        var mesh = new THREE.Points(geometry, pointMaterial);
        //mesh.scale.multiplyScalar( 100 );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //console.log(mesh);
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
            //console.log(intersects[0].distance);
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

    if (e.code == "KeyC"){//helper function
        clearTrace();
    }
    if (e.code == "KeyL"){
        loadTrace();
    }

    if (window.walk || window.crawl){
        switch (e.code){
            case "ArrowUp":
                //console.log("arrowup", blocked);
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
        if (e.code =="Space"){
            console.log("jump");
            if (!window.isJumping){
                trace_data.push(Math.round(camera.position.x*10)/10); //round position value to reduce data size
                trace_data.push(Math.round(camera.position.y*10)/10);
                trace_data.push(Math.round(camera.position.z*10)/10);
                console.log("trace_data", trace_data);
                velocity = 3;
                window.isJumping = true;
            }
        }

        if (window.isJumping){
            switch (e.code){
                case "ArrowUp":
                    //console.log("forward");
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
    var num_of_scenes = 5;
    var key = getRandomInt(1,num_of_scenes+1);
    while (key == window.sceneIndex){
        key = getRandomInt(1,num_of_scenes+1);
    }
    return "scene_"+key+".html";
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function record(){
    var location_data=[];

    if (window.walk || window.crawl){
        setInterval(function(){
            location_data.push(Math.round(camera.position.x*10)/10); //round position value to reduce data size
            location_data.push(Math.round(camera.position.y*10)/10);
            location_data.push(Math.round(camera.position.z*10)/10);
            //console.log(location_data);
            if (location_data.length >= 60){
                console.log("send data", location_data.join(","));

                var trace = localStorage.getItem("trace");

                if (!trace){
                    trace = {};
                } else {
                    trace = JSON.parse(trace);
                }

               // console.log("trace",trace);

                var loc; //string
                if (trace["scene-"+window.sceneIndex]){
                    loc = trace["scene-"+window.sceneIndex] +"," + location_data.join(",");
                } else {
                    loc = location_data.join(",");
                }
                trace["scene-"+window.sceneIndex] = loc;

                //console.log("trace",trace);
                localStorage.setItem('trace', JSON.stringify(trace));
                //console.log(localStorage);

                location_data = [];

            }
        }, 500);

    } else if (window.jump){
        setInterval(function(){
            console.log(window.sceneIndex, "sending data every 10 sec...", trace_data);
            var trace = localStorage.getItem("trace");
            if (!trace){
                trace = {};
            } else {
                trace = JSON.parse(trace);
            }

            console.log("trace before uplodate", trace);
            var loc; //string
            if (trace["scene-"+window.sceneIndex]){
                loc = trace["scene-"+window.sceneIndex] +"," + trace_data;
            } else {
                loc = trace_data;
            }
            console.log(loc);
            trace["scene-"+window.sceneIndex] = loc;

            //console.log("trace",trace);
            localStorage.setItem('trace', JSON.stringify(trace));
            console.log(trace);
            trace_data = []; //empty trace_data

        }, 10000);
    }
}

function loadTrace(){
    console.log("load trace");
    var trace = localStorage.getItem("trace");
    if (trace){
        trace = JSON.parse(trace);
        var trace_of_scene = trace["scene-"+window.sceneIndex];
        if (trace_of_scene){
            console.log("trace of scene", window.sceneIndex, trace_of_scene);
            var path_array = trace_of_scene.split(",");
            if (window.pointCloud){
                paint_point_trace(path_array);
            } else if (window.walk || window.crawl){
                paint_line_trace(path_array);
            } else if (window.jump){
                paint_curve_trace(path_array);
            }

        }
    }
}

function paint_point_trace(path_array){
    console.log("enlarge point", path_array);
    var points = [];
    var positions = [];
    var obj = scene.getObjectByName("landscape",true);

    console.log(obj);

    var trace = new THREE.Group();
    trace.name = "trace";

    for(var i=0; i<path_array.length/3; i++){
        var pos_x = parseFloat(path_array[i*3]);
        var pos_y = parseFloat(path_array[i*3+1])-camera_height/2; 
        var pos_z = parseFloat(path_array[i*3+2]);
        points.push( new THREE.Vector3( pos_x, pos_y, pos_z ) ); 
        positions.push(pos_x, pos_y, pos_z);


        var camera_pos = THREE.Vector3(pos_x, pos_y, pos_z);
        var yVector = new THREE.Vector3(0,-1,0);
        var vertical_ray = new THREE.Raycaster(camera_pos, yVector);
        var intersects = vertical_ray.intersectObject(obj, true);
        if (intersects.length>0){
            //console.log(intersects[0]);
            var pointGeo = new THREE.SphereGeometry( 5, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 'white'} );
            var sphere = new THREE.Mesh( pointGeo, material );
            sphere.position.set(pos_x, pos_y, pos_z);
            trace.add(sphere);
        }
    }
    scene.add(trace);
}

function paint_curve_trace(path_array){
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
                var material = new THREE.LineBasicMaterial( { color: 'white' } );
                var ellipse = new THREE.Line( geometry, material );

                //ellipse.position.set((pos_x1+pos_x2)/2, (pos_y1+pos_y2)/2, pos_z1);
                trace.add(ellipse);
            }
        }
    }
    scene.add(trace);
}


function paint_line_trace(path_array){
    console.log("paint line", path_array);
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
    var material = new THREE.LineBasicMaterial( { color: 'white' } );
    const material3 = new THREE.MeshPhongMaterial({
        color:'white',
        opacity: 0.5,
        transparent: true,
    });
    var material1 = new THREE.LineBasicMaterial( {
        color: 'white',
        linewidth: 5,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin:  'round' //ignored by WebGLRenderer
    } );

    var material2 = new THREE.LineDashedMaterial( {
        color: 'white',
        linewidth: 5,
        scale: 2,
        dashSize: 1,
        gapSize: 1,
    } );

    var line = new THREE.Line( geometry, material );

    // var positions = [];
    // var colors = [];

    // //var points = GeometryUtils.hilbert3D( new THREE.Vector3( 0, 0, 0 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );

    // var spline = new THREE.CatmullRomCurve3( points );
    // var divisions = Math.round( 12 * points.length );
    // var point = new THREE.Vector3();
    // var color = new THREE.Color();

    // for ( var i = 0, l = divisions; i < l; i ++ ) {

    //     var t = i / l;

    //     spline.getPoint( t, point );
    //     positions.push( point.x, point.y, point.z );

    //     color.setHSL( t, 1.0, 0.5 );
    //     colors.push( color.r, color.g, color.b );

    // }
    // console.log(points, positions);

    // Line2 ( LineGeometry, LineMaterial )

    // var geometry = new THREE.LineGeometry();
    // geometry.setPositions( positions );
    // // geometry.setColors( colors );
    // matLine = new THREE.LineMaterial( {

    //     color: 'white',
    //     linewidth: 5, // in pixels
    //     vertexColors: true,
    //     //resolution:  // to be set by renderer, eventually
    //     dashed: false

    // } );

    // var line2 = new THREE.Line2( geometry, matLine );

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