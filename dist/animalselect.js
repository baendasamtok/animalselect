(function (factory) {
if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module depending on jQuery.
    define(['jquery'], factory);
} else {
    // No AMD. Register plugin with global jQuery object.
    factory(jQuery);
}
}(function ($) {

    $.fn.animalselect = function (options) {

    	var template='\
    	<div class="extra-form">\
			<input data-attrleft="KYN_NUMER" type="text" placeholder="Kýn" class="filter_left"></input>\
			<input data-attrleft="STADA_NUMER" type="text" placeholder="Staða"class="filter_left" ></input>\
		</div>\
		<div class="double_container">\
			<div style="display: inline-flex;">\
				<!-- Select left -->\
				<div>\
					<input id="animals_filter_1" type="text" placeholder="Gripir" class="filter_input filter_left" data-attrleft="VALNR">\
					<select id="animals_select_1" multiple></select>\
					<div id="numbers_left" class="numbers"></div>\
				</div>\
				<!-- buttons -->\
				<div class="select_buttons_div">\
				  <div id="select_buttons_div">\
				    <input id="move_right" type="button" value="&gt;&gt;" /><br>\
				    <input id="move_left" type="button" value="&lt;&lt;" />\
				  </div>\
				 </div>\
				<!-- Select right -->\
				<div >\
					<input id="animals_filter_2" type="text" placeholder="Valdar gripir" class="filter_input">\
					<select id="animals_select_2" multiple ></select>\
					<div id="numbers_right"  class="numbers"></div>\
				</div>\
			</div>\
		</div>'

    	$(this).html(template)
		var animals_list;
		var filteredLeft;
		var rightList=new Array();
		var filteredRight=new Array();

		set_listeners()

		if(!options._service){

			fill_list($("#animals_select_1"),options._data)
			animals_list=options._data
			$("#animals_select_1").trigger('loaded');

		}else{

			$.getJSON(options._service,{farm_id:1633941}).done(function(data){ 
				fill_list($("#animals_select_1"),data.herdlist)
				animals_list=data.herdlist
				$("#animals_select_1").trigger('loaded');
				console.info(JSON.stringify(data.herdlist[1]))
			})

		}



		function fill_list(_select,_animals){
			var template_animals = $('#template_animals').html();
			var html_animals = Mustache.render('{{#animals}}<option value="{{NUMER}}">{{VALNR}}</option>{{/animals}}',{animals:_animals});
			_select.html(html_animals);
			$("#numbers_left").html("("+_animals.length+")")
		}
		
		function set_listeners(){

			select1=$("#animals_select_1")
			select2=$("#animals_select_2")
			right=$("#move_right")
			left=$("#move_left")

			// left/right button listeners
			left.on("click",function () {
				var selectedItems = select2.find('option:selected')
				select1.append(selectedItems);
				_.each(selectedItems,function(item,index){

					//rightList.push(find_animal(animals_list,$(item).val()))
					remove_from_list($(item).val())

					
					if(rightList.length==0){
						$("#numbers_right").html("")
					}else{
						$("#numbers_right").html("("+rightList.length+")")
					}
					
				})

			});

			right.on("click",function () {
				var selectedItems = select1.find('option:selected')
				select2.append(selectedItems);
				_.each(selectedItems,function(item,index){

					rightList.push(find_animal(animals_list,$(item).val()))
					
					if(rightList.length==0){
						$("#numbers_right").html("")
					}else{
						$("#numbers_right").html("("+rightList.length+")")
					}

				})

			});

			// doubleclick listeners
			select1.on('dblclick',function() {
				var selectedItem = select1.find('option:selected')
				select2.append(selectedItem);
				select2.trigger("change");
				rightList.push(find_animal(animals_list,$(selectedItem).val()))
				if(rightList.length==0){
					$("#numbers_right").html("")
				}else{
					$("#numbers_right").html("("+rightList.length+")")
				}
			})

			select2.on('dblclick',function() {
				var selectedItem = select2.find('option:selected')
				select1.append(selectedItem);
				select1.trigger("change");
				remove_from_list($(selectedItem).val())
				if(rightList.length==0){
					$("#numbers_right").html("")
				}else{
					$("#numbers_right").html("("+rightList.length+")")
				}
			})}

		function filter_right(_list,value){

			if(value.length>0){
				return _.filter(_list, function(animal){
					if(animal['VALNR'] == value){ return true }
				})
			}else{
				return _list
			}

		}

		function filter_left(_list){

			var keys_values=get_keys_filter()


			return _.filter(_list, function(animal){
				
				if( 

					(keys_values[0].val==animal[keys_values[0].key] || keys_values[0].val=='') &&
					(keys_values[1].val==animal[keys_values[1].key] || keys_values[1].val=='') &&
					(keys_values[2].val==animal[keys_values[2].key] || keys_values[2].val=='')  

				){

					return true
				}



			})				

		}

		function get_keys_filter(){

			var values=new Array()
			_.each($('input[data-attrleft]'),function(input){
				values.push({key:$(input).data('attrleft'),val:$(input).val()})
			})
			return values
		}

		function find_animal(_list,_numer){

			return _.find(_list, function(animal){
				if(_numer==animal['NUMER']){
					return true
				}
			})	}

		function remove_from_list(value){

			rightList=_.reject(rightList,function(animal){
				if(value==animal['NUMER']){
					return true
				}
			})}

		$("body").on("keydown",".filter_left",function(event){

			if(event.keyCode == 13 || event.keyCode == 9){
				event.preventDefault()
				$("#animals_select_1").html('');
				var filteredLeft=filter_left(animals_list)
				fill_list($("#animals_select_1"),filteredLeft)
				$("#numbers_left").html("("+filteredLeft.length+")")
				
			}})

		$("body").on("keydown","#animals_filter_2",function(event){

			if(event.keyCode == 13 || event.keyCode == 9){
				event.preventDefault()
				$("#animals_select_2").html('');
				var filteredRight=filter_right(rightList,$("#animals_filter_2").val())
				fill_list($("#animals_select_2"),filteredRight)

			}})

 		this.get_selected=function(){
 			return rightList
 		}

 		return this

    };  

}));