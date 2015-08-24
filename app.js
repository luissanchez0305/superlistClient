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
        document.getElementById('signinBtn').addEventListener('click', this.signin, false);
        //document.getElementById('modifyCategoriesButton').addEventListener('click', this.modifyCategories, false);
        
        document.addEventListener("backbutton", this.backButtonClicked, false);
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
        var value = window.localStorage["superlist_user"];
        if(typeof value === 'undefined') {
        	$.mobile.changePage("#signin");  
			changeDisplay(false);	
        }
        else{
			$('#signinloading').show();
			$.ajax({
				url: baseUrl + '/controllers/user.php',
				data: {e: value, type: 'exists'},
				success: function(data){
					$.mobile.changePage("#index");   
					$('#signinloading').hide();
					changeDisplay(true);	
				},
				error: function(xhr, status, error){
					alert('quantity: ' + status + ' ' + error);
				}
			});          	
        }         
    },
    backButtonClicked: function(e){
        if($.mobile.activePage.is('#products'))
	    	$.mobile.changePage("#index");
        else if($.mobile.activePage.is('#product'))
        	$('#backToProducts').click();
        else if($.mobile.activePage.is("#signup"))
  		  	$.mobile.changePage("#signin");   
        else if($.mobile.activePage.is('#index') || $.mobile.activePage.is('#signin'))
        	navigator.app.exitApp();
        else if($.mobile.activePage.is('#shoppinglist')){
	        navigator.notification.confirm(
		        'Desea salir?!',  // message
		        onConfirm,              // callback to invoke with index of button pressed
		        'Super list',            // title
		        'Volver,Salir'          // buttonLabels
	    	);	
        }
        else
            navigator.app.backHistory();            		
    },
    signin: function(){
    	$('#signinloading').show();
    	var email = $('#signinEmail').val();
    	var passd = $('#signinPassword').val();
    	
    	//Revisar credenciales desde webservice
    	$.ajax({
    	  url: baseUrl + '/controllers/user.php',
    	  data: {e: email, p: passd, type: 'cred'},
    	  success: function(data){
    		if(data.id > 0){
	        	$.mobile.changePage("#index");
    	        window.localStorage["superlist_user"] = email;
    	        window.localStorage["superlist_userid"] = data.id;
    	        if(typeof window.localStorage["superlist_listid"] === 'undefined' || window.localStorage["superlist_listid"].length == 0){
    	        	getUserFirstList(data.id);
    	      	}
    			$('#signinEmail').val('');
    	    	$('#signinPassword').val('');
				changeDisplay(true);
    		}
    		else
    			alert('Email y password no validos');
    		$('#signinloading').hide();
    	  	},
    	  dataType: 'json'
    	});    	
    },
    signup: function(){
		$('#registerloading').show();
    	var email = $('#registerEmail').val();
    	var passd = $('#registerPassword').val();
    	var name = $('#registerName').val();
    	var lastname = $('#registerLastname').val();

        var value = window.localStorage["superlist_user"];
        if(typeof value === 'undefined') {
        	if(passd.length > 0 && email.length > 0 && name.length > 0){
		    	//Revisar credenciales desde webservice
		    	$.ajax({
		    	  url: baseUrl + '/controllers/user.php',
		    	  data: {e: email, type: 'exists'},
		    	  success: function(data){
		    		if(data.id > 0){
		    			alert('Usuario ya existe');		
		    		}
		    		else {
		    			$.ajax({
		    				url: baseUrl + '/controllers/user.php',
		    				data: {i: 0, p: passd, e: email, n: name, a: lastname, type: 'manage'},
		    				success: function(data){
								$('#registerloading').show();
			    	    	    window.localStorage["superlist_user"] = email;
			    	    	    window.localStorage["superlist_userid"] = data.id;
				    	        if(typeof window.localStorage["superlist_listid"] === 'undefined'){
				    	        	getUserFirstList(data.id);
				    	      	}
			    		       	$.mobile.changePage("#index");
				    		    $('#registerEmail').val('');
				    		    $('#registerPassword').val('');
				    		    $('#registerName').val('');
				    		    $('#registerLastname').val('');
								$('#goToSigninBtn').hide();
								$('#showMenuBtn').show();
    							$('#signinBackBtn').hide();
		    				}
		    			});
		    		}
		    	  },
		    	  dataType: 'json'
		    	});
        	}
        	else {
        		alert('Introduce todas las opciones');
        	}   
        }
        else{
			$.ajax({
				url: baseUrl + '/controllers/user.php',
				data: {i: window.localStorage["superlist_userid"], p: passd, e: email, n: name, a: lastname, type: 'manage'},
				success: function(data){
					$('#registerloading').hide();
					window.localStorage["superlist_user"] = email;
					window.localStorage["superlist_userid"] = data.id;
				    $.mobile.changePage("#index");
				    $('#registerEmail').val('');
				    $('#registerPassword').val('');
				    $('#registerName').val('');
				    $('#registerLastname').val('');
				}
			});        	
        }
    },
    profile: function(){
    	var username = window.localStorage["superlist_user"];
    	if(typeof username === 'undefined'){
    		this.logout();
    	}
    	else{
			changeDisplay(true);	
			$('#profileControl').show();
	        $.mobile.changePage("#signup");
			$.ajax({
				url: baseUrl + '/controllers/user.php',
				data: {e: username, type: 'exists'},
				success: function(data){
					$('#registerEmail').val(username);
					$('#registerName').val(data.name);
					$('#registerLastname').val(data.lastname);		
				},		
				error: function(xhr, status, error){
					alert('Profile: ' + status + ' ' + error);
				}
			});
	        
			$('#registerPassword').val('');   
		} 	
    },
    logout: function(){
        $.mobile.changePage("#signin");      	
        window.localStorage.removeItem("superlist_user");
        window.localStorage.removeItem("superlist_userid");
		$('#registerEmail').val('');
		$('#registerPassword').val('');
		$('#registerName').val('');
		$('#registerLastname').val('');
		changeDisplay(false);
    }
};

function getUserFirstList(_uid){	
	$.ajax({
	  	url: baseUrl + '/controllers/lista.php',
	  	data: { uid: _uid, type:'getfirst'},
	  	success: function(data){
			window.localStorage["superlist_listid"] = data.id;
			$listBtn = $('.listBtn');
			$listBtn.html('Mis Listas ('+data.nombre+')');
	  	},
	  	error: function(xhr, status, error)    {
			alert('get first list: ' + status + ' ' + error);
		}    	
	});
}

function modifyCategories(add, id){	  
	$.ajax({
		url: baseUrl + '/controllers/categoria.php',
		data: { category: id, id: window.localStorage["superlist_userid"], type: add ? 'add' : 'delete' },
		type: "get",
		success: function (data){ loadCategories(); /*modifyCategoriesResult(data.success);*/ },
		error: function(xhr, status, error){
			alert('Categories update: ' + status + ' ' + error);
		}
	});
}

function modifyCategoriesResult(success){
	if(success){
		$('#modifyCategoriesText').html('Guardado con exito');
		setTimeout(function(){ $('#modifyCategoriesText').html(''); loadCategories(); navigator.app.backHistory(); }, 2000);
	}
	else
		$('#modifyCategoriesText').html('Hubo un error: ' + data.msg);
}

function changeDisplay($logged){
	if($logged){
		$('#signupBtn').html('Actualizar');    
    	$('#goToSigninBtn').hide();
    	$('#showMenuBtn').show();
    	$('#signinBackBtn').hide();		
       	$('#registerPassword').rules('remove'); 
        $('#profileControl').show();
        $('#cancelBackBtn').show();
       	loadCategories();
       	loadShoppingList($('#items'));
       	displayListBtn(true);
	}
	else 
	{		
		$('#signupBtn').html('Registrarse');    
    	$('#goToSigninBtn').show();
    	$('#showMenuBtn').hide();
    	$('#signinBackBtn').show();
       	$('#registerPassword').rules('remove'); 
       	$('#registerPassword').rules('add',{ required: true, messages: {required: "Por favor introduzca un password" } });
        $('#profileControl').hide();
        $('#profileLists').hide(); 
        $('#cancelBackBtn').hide();
		window.localStorage["superlist_user"] = '';
		window.localStorage["superlist_userid"] = '';
		window.localStorage["superlist_listid"] = '';
       	displayListBtn(false);
    }
}

function modifyQuantity(productId, quantity){
	var _lid = window.localStorage["superlist_listid"];
	if(typeof _lid === 'undefined' || _lid.length == 0){
		$.mobile.activePage.find('.listBtn').click();
	}
	else
		$.ajax({
			url: baseUrl + '/controllers/productQuantity.php',
			data: {pid: productId, lid: window.localStorage["superlist_listid"], qty: quantity},
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

function loadShoppingList($items){	
	if(typeof window.localStorage["superlist_listid"] != 'undefined'){
		$items.find('li').remove();
		$.ajax({
			url: baseUrl + '/controllers/productos.php',
			data: { lid: window.localStorage["superlist_listid"], type: 'lista' },
			type: 'get',
			dataType: 'json',
			success: function(data){
				$ul = $items;
			    $ul.listview();
			    var html = '';
				$.each(data, function(i, producto){
					html += '<li data-id="'+producto.id+'" data-status="buy">'+
							'<div style="width: 20%; float:left; margin-right: 5%;">'+
								'<img src="'+baseUrl+producto.imagen+'" style="width: 100%;"/>'+
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
						'</li>';
				});
				$ul.append(html);
				$ul.listview( "refresh" );
				$ul.trigger( "updatelayout");		
				$ul.find('.button').button();
			},
			error: function(xhr, status, error){
				alert('list: ' + status + ' ' + error);
			}	
		});
	}
}

function displayListBtn(show){
	$listBtn = $('.listBtn');
	if(show){	
		getActivatedLists(function(data){
			if(data.length > 1)
				$listBtn.removeClass('hide');
			else
				$listBtn.addClass('hide');
		});
	}		
	else
		$listBtn.addClass('hide');
}

function getActivatedLists(callback){	
		$.ajax({	
			url: baseUrl + '/controllers/lista.php',
			data: { uid: window.localStorage["superlist_userid"], type: 'userlists' },
			type: 'get',
			dataType: 'json',
			success: function(data){
				callback(data);
			},
			error: function(xhr, status, error){
				alert('user lists: '+ status + ' ' + error);
			}
		});
	
}

function updateUserPlace(obj,_pid){
	updateUserPlaceAjax(_pid);
	setTimeout(function(){
		disableSingleListItem(_pid);
	}, 500);
}

function disableSingleListItem(_pid){	
	getActivatedLists(function(data){
		$('.profileListItem').each(function(){
			if(data.length == 1 && this.value == 'yes')
				$(this).slider('disable');
			else{
				$(this).slider('enable');
				if(this.value == 'no' && window.localStorage["superlist_listid"] ==_pid){
					window.localStorage["superlist_listid"] = '';
					$listBtn = $('.listBtn');
					$listBtn.html('Mis Listas');					
				}
			}	
		});
			
	});	
}

function updateUserPlaceAjax(_pid){	
	$.ajax({
		url: baseUrl + "/controllers/usuario_lugar.php",
		dataType: "json",
		data: {
		    type: 'editplace',
		    pid: _pid
		},
		success: function(response){
			if(!response)
				alert('error');
			else
				displayListBtn(true);
		},
		error: function(xhr, status, error){
			alert('usuario_lugar actualizar: ' + status + ' ' + error);
		}
	});	
}

function chooseList(obj,id,name){
	window.localStorage["superlist_listid"] = id;
	$('#'+obj).popup('close');
	$listBtn = $('.listBtn');
	$listBtn.html('Mis Listas ('+name+')');
	
    if($.mobile.activePage.is('#shoppinglist'))
    	loadShoppingList($('#items'));
    else if($.mobile.activePage.is('#products'))
    	loadProducts(id);
    else if($.mobile.activePage.is('#product'))
		loadProduct(id);
}

function loadLists(){
	var userid = window.localStorage["superlist_userid"];
	$.ajax({
		url: baseUrl + "/controllers/usuario_lugar.php",
		dataType: "json",
		data: {
		    type: 'userlist',
		    uid: userid
		},
		success: function ( response ) {
			if(response.status == 'ok'){
				if(response.user_places.length > 0){
					$('#addNewList').hide();
					$('#my_lists').show();						
					$('#my_lists').html('');
		    		for(i = 0; i < response.user_places.length; i++){
		    			var user_place = response.user_places[i];
		    			if(user_place.ownerid == userid || (user_place.ownerid != userid && user_place.activo)){
			    			var input = '<div data-role="fieldcontain">'+
								(user_place.ownerid == userid ? '<select class="profileListItem" name="flip-3-'+i+'" id="flip-3-'+i+'" data-role="slider" data-theme="c" onchange="updateUserPlace(this,'+user_place.lugarid+')">'+
									'<option value="no" '+ (!user_place.activo ? 'selected="selected"' : '') + '>No</option>'+
									'<option value="yes"'+ (user_place.activo ? 'selected="selected"' : '') + '>Si</option>'+
								'</select>' : '') +
								'<label class="userPlaceTitle" for="flip-3">'+user_place.nombreLugar + (user_place.ownerid == userid ? ' ('+user_place.key+')' : '') + '</label>'+
							'</div>';
							$('#my_lists').append(input);
						}
					}
					disableSingleListItem();
					$('div[data-role="fieldcontain"]').trigger('create');
				}
				else {
					$('#addNewList').show();
					$('#my_lists').hide();									
				}
			}
		},
		error: function(xhr, status, error){
			alert('usuario_lugar: ' + status + ' ' + error);
		}
	});
}

function loadCategories(){	
	var userId = window.localStorage["superlist_userid"];
	if(typeof userId != 'undefined'){
		$.ajax({
			url: baseUrl + '/controllers/index.php',
			data: { id: userId },
			dataType: "json",
			success: function(data){
				$('#index .content .content-grid').remove();
				if(data.length>0){
					$.each(data, function(i, categoria){
						$('#index .content').append(
							'<div class="content-grid">'+
								'<a href="#products" class="b-link-stripe b-animate-go  thickbox" data-id="'+categoria.id+'">'+
									'<img  src="'+baseUrl+'/uploads/'+categoria.imagen+'" />'+
									'<div class="categoryName">'+categoria.nombre+'</div>'+
								'</a>'+
							'</div>'
						);
					});
					$('#addCategoriesText').hide();
				}
				else
					$('#addCategoriesText').show();				
			},
			error: function(xhr, status, error){
				alert('categorias: ' + status + ' ' + error);
			}
		});
	}
}

function loadProducts(_lid){
	$.ajax({
		url: baseUrl + '/controllers/productos.php',
		data: { id: $('#backToProducts').attr('data-id'), lid: _lid, type: 'productos' },
		type: 'get',
		dataType: 'json',
		success: function(data){
			$('#products .content .content-grid').remove();
			var count = data.length;
			if(count > 0)
				$.each(data, function(i, producto){
					$('#products .content').append(
						'<div class="content-grid">'+
							'<a href="#product" class="b-link-stripe b-animate-go thickbox" data-id="'+producto.id+'">'+
								'<img  src="'+baseUrl+producto.imagen+'" style="width:74%;height:74%; display:block; margin: auto;"/>'+
							'</a>'+
							'<div class="valueControllers">'+
								'<label style="padding-top:11px; padding-left: 5px; float:left; font-weight: bold; color: #3388cc;">' + producto.nombre + '</label>'+
		    					'<a style="float:right;" class="mngQty ui-shadow ui-btn ui-corner-all ui-icon-plus ui-btn-icon-notext ui-btn-inline">Button</a>'+
		    					'<label class="quantity" style="width: 10px; float:right;	padding-top: 15px; padding-right: 8px;">'+producto.cantidad+'</label>'+
		    					'<a style="float:right;" class="mngQty ui-shadow ui-btn ui-corner-all ui-icon-minus ui-btn-icon-notext ui-btn-inline">Button</a>'+
							'</div>'+
						'</div>'
					);							
					if(!--count){
						appendAddProduct($('#products .content'));																
					}
				});
			else
				appendAddProduct($('#products .content'));								
		},
		error: function(xhr, status, error){
			alert('productos: ' + status + ' ' + error);
		}
	});	
}

function loadProduct(_lid){
	if($('#productId').val() != '0' && $('#currentAction').val() != 'editar'){
		$('.addData').hide();
		$('#product .work-top.work-product').show();
		$('#product .work-top.work-add').hide();
		$('#product .work-in .info').show();
		$.ajax({
			url: baseUrl + '/controllers/productos.php',
			data: { id: $('#productId').val(), lid: _lid, type: 'producto' },
			type: 'get',
			dataType: 'json',
			success: function(data){
				$('#productImage').attr('src', '');
				$('#productBrand').html('');
				$('#lastDate').html('');
				$('#lastQty').html('');
				$('#productQty').html('');
							
				$('#productImage').attr('src', baseUrl + data.imagen);
				$('#productBrand').html(data.marca);
				if(data.ultimaFecha){
					$('#lastDate').html('Fue el ' + data.ultimaFecha);
					$('#lastQty').html('Compró ' + data.ultimaCantidad + ' unidad' + (data.ultimaCantidad > 1 ? 'es' : ''));
				}
				else{					
					$('#lastDate').html('Nunca lo ha comprado antes');	
					$('#lastQty').html('');
				}
				
				$('#productQty').html(data.cantidad);
			},
			error: function(xhr, status, error){
				alert('producto: ' + status + ' ' + error);
			}
			
		});
	}
	else{	
		$('.addData').show();
		$('#product .work-top.work-product').hide();
		$('#product .work-top.work-add').show();
		$('#product .work-in .info').hide();					
    	$('#camera-image').attr('src','');
    	$('#imageName').val('');
    	$('#currentState').html('');
		$('#addProductName').val('');
		$('#addBrandName').val('');
		$('#product').find('input[placeholder="Producto"]').val('');
		// editar producto
    	if($('#productId').val() != '0' && $('#currentAction').val() == 'editar'){    
			$('#productName, .productTitle').html('Editar un producto');
    		$('#currentAction').val('editar');  
			$.ajax({
				url: baseUrl + '/controllers/productos.php',
				data: { id: $('#productId').val(), lid: _lid, type: 'producto' },
				type: 'get',
				dataType: 'json',
				success: function(data){
					$('#camera-image').attr('src', baseUrl + data.imagen);
					$('#imageName').val(data.imagen.substring(data.imagen.lastIndexOf('/')));
					$('#addProductName').val(data.id);
					$('#product').find('input[placeholder="Producto"]').val(data.nombre);
				},
				error: function(xhr, status, error){
					alert('edit product: ' + status + ' ' + error);
				}
			});
    	}
	}	
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
	var _ids = $('#shoppinglist').find('li[data-status="bought"]').map(function(){ return $(this).attr('data-id'); });
	$.ajax({
		url: baseUrl + '/controllers/productos.php',
		data: { ids: _ids.get(), lid: window.localStorage["superlist_listid"], type: 'compra' },
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
	$('#product').find('input[placeholder="Marca"]').val($this.html());
	$('#brandNameAutocomplete').html('');
}

function chooseProducto(obj){
	var $this = $(obj);
	$('#addProductName').val($this.attr('data-id'));
	$('#product').find('input[placeholder="Producto"]').val($this.html());
	$('#productNameAutocomplete').html('');
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
        $('#imageUploaded').val('true');
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
        $('#imageUploaded').val('true');
    }

    function onFail(message) {
        $('#currentState').html('Failed to get an image');
        $('#camera-image').attr('src','');
    }    
}

function manageProduct(_product, _name, _trademarkname, _trademark, _category, _image){
	if(_image.length > 0 && $('#imageUploaded').val() == 'true'){
		var ft = new FileTransfer(), options = new FileUploadOptions();
	
	    options.fileKey = "file";
	    options.fileName = 'filename.jpg'; // We will use the name auto-generated by Node at the server side.
	    options.mimeType = "image/jpeg";
	    options.chunkedMode = false;
	    options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
	        "description": "Uploaded from my phone"
	    };
	    $('#currentState').html(_image);
		try{
		    ft.upload(_image, baseUrl + "/controllers/upload.php",
		        function (e) {
		        	$('#currentState').html('Uploaded');
		        	sendProduct(_product, _name, _trademarkname, _trademark, _category, e.response);
		        },
		        function (e) {
		            $('#currentState').html('Upload failed - ' + e.source + ' - ' + e.code + ' - ' + e.target);
		        }
		    , options);
	   	}
		catch(err) {
		    $('#currentState').html('uploadImage ft.upload ' + err.message);
		}
	}
	else
		sendProduct(_product, _name, _trademarkname, _trademark, _category);
}

function sendProduct(_product, _name, _trademarkname, _trademark, _category, _image){
    $.ajax({
    	url: baseUrl + '/controllers/producto.php',
    	type: 'GET',
    	dataType: 'json',
		data: { type: 'manejar', pId: _product, tmName: _trademarkname, tmId: _trademark, cId: _category, name: _name, 
				image: _image },
    	success: function(data){
    		// todo: notificacion de que se guardo con exito    
        	$('#imageUploaded').val('false');
		    if($('#currentAction').val() == 'agregar')
		    	$('#backToProducts').click();	
		    else{
		    	$('#products').find('a[data-id="'+$('#productId').val()+'"]').click();
		    	$('#productName, .productTitle').html(_name);
		    }	
    	},
		error: function(xhr, status, error){
			alert('sendProduct: ' + status + ' ' + error);
		}
    });
}
