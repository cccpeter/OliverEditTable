/**
 * [editTable 基于jq行内编辑table]
 * @Author   Oliver
 * @DateTime 2020-3-18
 * @version  [1.1]
 * @method [getNowIndex] 获取当前的下标
 * @method [getNowIndexList] 获取当前所有的顺序下标，返回string
 * @method [addRow(输入json数组)] 添加行数据，返回json数组对应生成的行渲染数据
 * @method [delRow] 删除行数据，
 * @method [getTableData] 获取整个table的数据，返回json数组
 * @method [mapToObj] 转化map为object[为了实现序列化]，返回object
 * @method [getTableLength] 获取整个table的行数
 * 外置的事件捕获函数
 * @method [addRow] 点击新建行的触发
 *         formatter返回的参数为:formatter(value,el,rowDate)
 * @method [delRow] 点击删除行的触发
 * @type {Object}
 * @Version[1.2] 
 * @Last Modified: by Oliver
 * @Last DateTime 2020-4-18
 * 较1.1版本新增了功能点：
 * 1、版本兼容同页面多个行内编辑组件
 * 2、初始化组件需要传入table的ID
 * 3、获取更改的数据
 * 4、添加选择(拥有属性包括data-field["true","false"],data-select[radio,check],readonly)（单元与多选）功能
 * 5、添加接口(getSelectData)：获取选中数据 待做
 * @Version[1.3]
 * 1、 预添加固定列功能 待做
 */
var editTable = {
	// 对应的字段key->直接渲染td
	field : "data-field",
	// 返回formatter(字段对应值,下标)给执行函数
	formatter : "data-formatter",
	// 是否将该列隐藏(true or false)注意：hidden属性只能用于input
	hiddenRow : "data-hidden",
	// 对应的组件(select,input(默认))
	type : "data-type",
	// 是否显示行内编辑添加按钮(字符串值默认"false")
	editable : "data-editable",
	// 是否禁用(字符串值默认"false")
	readonly : "data-readonly",
	select : "data-select",
	createExample:function(el){
		var nowIndex = 0;
		var nowIndexList = "";
		var trId = el+"trId";
		var template = "";
		var example = {}; 
		example.getNowIndex = function(){
			return nowIndex;
		};
		example.getNowIndexList = function(){
			return nowIndexList;
		};
		example.cleanDate = function(){
			nowIndex = 0;
			nowIndexList = "";
		};
		example.mapToObj = function(map){
		    var obj = {};
		    map.forEach(function(value,key){
				obj[key] = value;
			});
		    return obj;
		};
		example.getTableLength = function(){
			var length = 0;
			if(nowIndexList!=null && nowIndexList!=undefined && nowIndexList!=""){
				var list = nowIndexList.split(",");
				length = list.length-1;
			}
			return length;
		};
		example.getSelectData = function(el){
			var checkTableData = new Array();
			var elList = $("#"+el+" input[name='btSelectItem']");
			var checkIdList = new Array();
			if(elList==undefined || elList==null || elList.length==0 || template==undefined || template==null || template.length==0){
				return checkTableData;
			}
			for(var i=0;i<elList.length;i++){
				if(elList[i].checked == true){
					checkIdList.push(elList[i].dataset.index);
				}

			}
			for(var i=0;i<checkIdList.length;i++){
				var map = new Map();
				for(var key in template){
					map.set(key,$("#"+key+checkIdList[i]).val());
				}
				checkTableData[i] = example.mapToObj(map);
			}
			return checkTableData;
		};
		example.getTableData = function(){
			if(template!=null && template!=undefined && template!=""){
				if(nowIndexList!=null && nowIndexList!=undefined && nowIndexList!=""){
					var list = nowIndexList.split(",");
					var tableData = new Array();
					for(var i=0;i<list.length-1;i++){
						var index = list[i].replace(trId,"");
						var map = new Map();
						for(var key in template){
							map.set(key,$("#"+key+index).val());
						}
						tableData[i] = example.mapToObj(map);
					}
					return JSON.stringify(tableData);
				}
			}
			return "";
		};
		example.getTableChangeData = function(){
			if(template!=null && template!=undefined && template!=""){
				if(nowIndexList!=null && nowIndexList!=undefined && nowIndexList!=""){
					var list = nowIndexList.split(",");
					var tableData = new Array();
					var indexChange = 0;
					for(var i=0;i<list.length-1;i++){
						var ischange = $("#"+list[i]).attr("ischange");
						if(ischange == "true"){
							var index = list[i].replace(trId,"");
							var map = new Map();
							for(var key in template){
								map.set(key,$("#"+key+index).val());
							}
							tableData[indexChange] = example.mapToObj(map);
							indexChange++;
						}
					}
					return JSON.stringify(tableData);
				}
			}else{
				throw new TypeError('The template is undefined!');
				return false;
			}
			return "";
		};
		example.addRow = function(el,rowData){
			var render = "";
			// json is not empty
			if(rowData==undefined || rowData==null || rowData==""|| el=="" || el==null){
				return false;
			}
			// table head
			var table = document.getElementById(el);
			var rows = table.rows;
			if(rows == undefined){
				throw new TypeError('The table element is not find!');
				return false;
			}
			var fieldList = new Array();
			var formatterList = new Array();
			var typeList = new Array();
			var readonlyList = new Array();
			var hiddenRowList = new Array();
			// editable列的优先级最高
			var editableList = new Array();
			var selectList = new Array();
			for(var i=0; i<rows[0].cells.length; i++){
				var attr = rows[0].cells[i].attributes;
				for(var j=0;j<attr.length;j++){
					if(attr[j].name == editTable.field){
						fieldList.push(attr[j].value);
					}
					if(attr[j].name == editTable.formatter){
						formatterList.push(attr[j].value);
					}
					if(attr[j].name == editTable.hiddenRow){
						hiddenRowList.push(attr[j].value);
					}
					if(attr[j].name == editTable.type){
						typeList.push(attr[j].value);
					}
					if(attr[j].name == editTable.editable){
						editableList.push(attr[j].value);
					}
					if(attr[j].name == editTable.readonly){
						readonlyList.push(attr[j].value);
					}
					if(attr[j].name == editTable.select){
						selectList.push(attr[j].value);
					}
				}
				// save cloumn order
				if(fieldList.length == i){
					fieldList.push("");
				}
				if(formatterList.length == i){
					formatterList.push("");
				}
				if(hiddenRowList.length == i){
					hiddenRowList.push("");
				}
				if(typeList.length == i){
					typeList.push("");
				}
				if(editableList.length == i){
					editableList.push("");
				}
				if(readonlyList.length == i){
					readonlyList.push("");
				}
				if(selectList.length == i){
					selectList.push("");
				}
			}
			for(var row in rowData){
				render += "<tr id='"+trId+nowIndex+"'>";
				// all list
				nowIndexList = nowIndexList+trId+nowIndex+","
				// tmplate render
				var templ = JSON.stringify(rowData[row]);
				var rowDataList = templ;
				// deep copy
				templ = JSON.parse(templ);
				for(var value in templ){
					templ[value]="";
				}
				// render temp
				template = templ;
				templ = JSON.stringify(templ);
				for(var i=0;i<fieldList.length;i++){
					// add select
					// debugger;
					if(selectList[i] == "check"){
						// render += "<td style='text-align: center; width: 100px;'><a id='addRows"+nowIndex+"' style='font-size: 18px;font-weight: bolder;' class='addRows'  title='新增一行' style='font-size: 12px; font-weight: bolder;'  onclick=addRow('"+el+"','["+templ+"]','"+trId+nowIndex+"')>+</a> <a class='removeRows' onclick=delRow('"+el+"','["+rowDataList+"]','"+trId+nowIndex+"') title='删除该行'>一</a></td>"
						render += "<td style='text-align: center; width: 100px;'><input data-index='"+nowIndex+"' name='btSelectItem' type='checkbox'></td>";
					}else if(selectList[i] == "radio"){
						render += "<td style='text-align: center; width: 100px;'><input data-index='"+nowIndex+"' name='btSelectItem' type='radio'></td>";
					}
					if(editableList[i]=="true"){
						render += "<td style='text-align: center; width: 100px;'><a id='addRows"+nowIndex+"' style='font-size: 18px;font-weight: bolder;' class='addRows'  title='新增一行' style='font-size: 12px; font-weight: bolder;'  onclick=addRow('"+el+"','["+templ+"]','"+trId+nowIndex+"')>+</a> <a class='removeRows' onclick=delRow('"+el+"','["+rowDataList+"]','"+trId+nowIndex+"') title='删除该行'>一</a></td>"
					}
					var isReadOnly = readonlyList[i]=="true"?"readonly='readonly'":"";
					if(fieldList[i]!=""){
						// field cloumn is exist
						if(formatterList[i]!=""){
							// formatter(value,el)
							var rowNowData = JSON.stringify(rowData[row]);
							var formatterReturn= eval(formatterList[i]+"('"+rowData[row][fieldList[i]]+"','"+fieldList[i]+nowIndex+"','"+rowNowData+"')");
							render += "<td>"+formatterReturn+"</td>";
						}else if(typeList[i]=="input"){
							if(hiddenRowList[i]=="true"){
								render += "<td style='display:none;'><input type='hidden' autocomplete='off' class='form-control input-text' id='"+fieldList[i]+nowIndex+"' value='"+rowData[row][fieldList[i]]+"' "+isReadOnly+"></td>"
							}else{
								render += "<td><input autocomplete='off' onchange=$(this).parent().parent().attr('ischange','true') class='form-control input-text' id='"+fieldList[i]+nowIndex+"' value='"+rowData[row][fieldList[i]]+"' "+isReadOnly+"></td>"
							}
							
						}else if(typeList[i]=="select"){
							render += "<td><select onchange=$(this).parent().parent().attr('ischange','true') class='form-control' id='"+fieldList[i]+nowIndex+"' value='"+rowData[row][fieldList[i]]+"' "+isReadOnly+"></select></td>"
						}else if(typeList[i]=="text"){
							render += "<td><input type='hidden' id='"+fieldList[i]+nowIndex+"' value='"+rowData[row][fieldList[i]]+"'><span>"+rowData[row][fieldList[i]]+"</span></td>"
						}else{
							render += "<td><input onchange=$(this).parent().parent().attr('ischange','true') class='form-control input-text' id='"+fieldList[i]+nowIndex+"' value='"+rowData[row][fieldList[i]]+"' "+isReadOnly+"></td>"
						}
					}
				}
				render +="</tr>";
				nowIndex++;
			}
			$("#"+el).prepend(render)
			return render;
		};
		example.delRow = function(rowId){
			$("#"+rowId).remove();
			if(nowIndexList!=null && nowIndexList!=undefined && nowIndexList!=""){
				nowIndexList = nowIndexList.replace(rowId+",","");
			}
		};
		return example;
	}
}