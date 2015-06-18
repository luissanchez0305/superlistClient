/**
 * @author LuisRicardo
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var lugar = 3;
var baseUrl = 'http://superlist.esferasoluciones.com';

function modifyQuantity(productId, quantity){
	$.ajax({
		url: baseUrl + '/controllers/productQuantity.php',
		data: {pid: productId, lid: lugar, qty: quantity},
		type: 'get',
		success: function(data){
			if(data)
				console.log('success');
			else
				console.log('fail');
		},
		error: function(xhr, status, error){
			alert('quantity: ' + status + ' ' + error);
		}
	});
}

function loadList($items){	
		$items.find('li').remove();		
		$.ajax({
			url: baseUrl + '/controllers/productos.php',
			data: { lid: lugar, type: 'lista' },
			type: 'get',
			dataType: 'json',
			success: function(data){
				var count = data.length;
				$.each(data, function(i, producto){
					$items.append(				
						'<li data-id="'+producto.id+'" data-status="buy">'+
							'<div style="width: 20%; float:left; margin-right: 5%;">'+
								'<img src="images/'+producto.imagen+'" style="width: 100%;"/>'+
							'</div>'+
							'<div class="textContainer" style="width: 65%; float:left;">'+
								'<p class="header">'+producto.nombre+'</p>'+
								'<p class="quantity">'+producto.cantidad+'</p>'+
								'<p class="status green">Comprar</p>'+
							'</div>'+
							'<div style="width: 10%; float: right;">'+
								'<a class="button" data-icon="check" style="width:60px; height: 50px; float: left; margin-right: 10px;" onclick="buy(this)"></a>'+
								'<a class="button" data-icon="delete" style="width:60px; height: 50px; float: left;" onclick="unbuy(this)"></a>'+
							'</div>'+
						'</li>');
					if(!--count){
						$items.listview('refresh');
						$items.find('button').button();								
					}
				});
			},
			error: function(xhr, status, error){
				alert('list: ' + status + ' ' + error);
			}	
		});
}

function appendAddProduct($obj){			
	$obj.append('<div class="content-grid">'+
		'<a href="#product" class="b-link-stripe b-animate-go thickbox" data-id="0">'+
			'<img  src="'+ baseUrl + '/uploads/add-icon.png" style="width:74%;height:74%; display:block; margin: auto;"/>'+
		'</a>'+
	'</div>');
}

function buy(obj){
	$this = $(obj);
	$ul = $this.parents('ul');
	$li = $this.parents('li');
	$status = $li.find('.status');
	if(!$status.hasClass('red')){
		$status.html('Comprado').removeClass('green').addClass('red');
		$li.attr('data-status', 'bought');
		$this.parents('li').remove();
		$ul.append($li);
		$li.find('.button').button();
	}
}

function unbuy(obj){			
	$this = $(obj);
	$this.parents('li').attr('data-status', 'buy');
	$this.parents('li').find('.status').html('Comprar').removeClass('red').addClass('green');
}

function buyList(){
	var _ids = $('#list').find('li[data-status="bought"]').map(function(){ return $(this).attr('data-id'); });
	$.ajax({
		url: baseUrl + '/controllers/productos.php',
		data: { ids: _ids.get(), lid: lugar, type: 'compra' },
		dataType: 'json',
		type: 'get',
		success:  function(data){
			if(data){
				$('#popupSuccess').click();
				$('#items li').remove();
			}
			else
				console.log('fail');					
		},
		error: function(xhr, status, error){
			alert('buy: ' + status + ' ' + error);
		}				
	});
}

function chooseMarca(obj){
	var $this = $(obj);
	$('#addBrandName').val($this.attr('data-id'));
	$('#addProductForm').find('input[data-type="search"]').val($this.html());
	$('#brandNameAutocomplete').html('');
}

function getPictureFromCamera(){
	try {
    	navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType:Camera.DestinationType.FILE_URI });
	}
	catch(err) {
	    $('#currentState').html('getPictureFromCamera navigator.camera ' + err.message);
	}
	
    function onSuccess(imageURI) {
        $('#camera-image').attr('src',imageURI);
    }

    function onFail(message) {
        $('#currentState').html('Failed to get an image');
        $('#camera-image').attr('src','');
    }   
}

function getPictureFromGallery(){
	try {
    	navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
	}
	catch(err) {
	    $('#currentState').html('getPictureFromGallery navigator.camera ' + err.message);
	}
	
    function onSuccess(imageURI) {            
        $('#camera-image').attr('src',imageURI);
    }

    function onFail(message) {
        $('#currentState').html('Failed to get an image');
        $('#camera-image').attr('src','');
    }    
}

function addProduct(_name, _trademark, _category, _image){
	if(_image.length > 0){
		var ft = new FileTransfer(), options = new FileUploadOptions();
	
	    options.fileKey = "file";
	    options.fileName = 'filename.jpg'; // We will use the name auto-generated by Node at the server side.
	    options.mimeType = "image/jpeg";
	    options.chunkedMode = false;
	    options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
	        "description": "Uploaded from my phone"
	    };
	
	    ft.upload(image, baseUrl + "/controllers/upload.php",
	        function (e) {
	        	console.log('Uploaded');
	        	sendProduct(_name, _trademark, _category, e.response);
	        },
	        function (e) {
	            $('#currentState').html('Upload failed - ' + e.source + ' - ' + e.code + ' - ' + e.target);
	        }
	    , options);
   	}
   	else
   		sendProduct(_name, _trademark, _category);
}

function sendProduct(_name, _trademark, _category, _image){	
    $.ajax({
    	url: baseUrl + '/controllers/producto.php',
    	type: 'GET',
    	dataType: 'json',
		data: { type: 'agregar', tmId: _trademark, cId: _category, name: _name, image: _image },
    	success: function(data){
    		// todo: notificacion de que se guardo con exito    		
		    $('#backToProducts').click();
    	},
		error: function(xhr, status, error){
			alert('buy: ' + status + ' ' + error);
		}
    });
}
