var xmind = require('xmind');
var xlsx = require('node-xlsx');
var fs = require('fs');
const moment = require('moment')

var testsuit = []
var topic = ''


function print(data){
    console.log(data)
}

//读取xmind文件
function readXmind(file){
	// open xmind file
	var workbook = xmind.open(file);
	// get the primary sheet
	var sheet = workbook.getPrimarySheet();
	// get the root topic
	rootTopic = sheet.rootTopic
	topic = rootTopic.getTitle()
	return(rootTopic.toJSON())
}



function write2excel(fileName, data){

	var buffer = xlsx.build([{name: topic, data: data}]); // Returns a buffer

	//将文件内容插入新的文件中
	fs.writeFileSync(fileName,buffer,{'flag':'w'});
}



function parts2steps(parts){
	steps = []
	step = {}
	for(var i=0;i<parts.length;i++){
		// part 为 前置条件，添加到 steps 里
		if (parts[i]["condition"]){
			step["condition"] = parts[i]["condition"]
		}
		// part 为 测试步骤
		else if (parts[i]["action"]){
			step["action"] = parts[i]["action"]
			// 如果有下一个 part，且不是 预期结果，则该步骤结束，添加到 steps 里，初始化 step
			if ((i+1<parts.length) && (!parts[i+1]["expected"])){
				steps.push(step)
				step = {}
			}
		}
		// part 为 预期结果，添加到 steps 里，该步骤结束，初始化 step
		else if (parts[i]["expected"]){
			step["expected"] = parts[i]["expected"]
			steps.push(step)
			step = {}
		}
	}
	return steps
}


function zero(num, n) {
	return (Array(n).join(0) + num).slice(-n);
}


function testsuit2excel(){
	let num = 0
	var data = [['功能模块与路径', '用例编号', '前置条件', '用例名称',  '操作步骤', '预期结果', '标记', '优先级', '用例属性', '编制人员', '用例设计时间', '备注']]

	for (testcase of testsuit){
		num++
		tc = [testcase['module'], 's_' + zero(num, 3), testcase['steps'][0]['condition'], testcase['title'], testcase['steps'][0]['action'], testcase['steps'][0]['expected'], '', testcase['steps'][0]['priority'], '', '', moment(new Date).format("YYYY-MM-DD"), '']
		data.push(tc)
		for (step of testcase['steps'].slice(1)){
			data.push(['', '', '', '', step['action'], '', '', '', '', '', '', ''])
			if (step['condition']){tc.splice(2, 1, step['condition'])}
			if (step['expected']){tc.splice(5, 1, step['expected'])}
			if (step['priority']){tc.splice(7, 1, step['priority'])}
		}
	}
	return data
}


function json2testsuit(data, module=''){
	children = data['children']
	// 如果没有子节点(即子节点为0),则本节点为步骤部件(前置条件/测试步骤/预期结果/优先级)
	if (children.length == 0){
		part = {'condition':'', 'action':'', 'expected':'', 'priority':''}
		title = data['title']
		// 根据标题开头字段判断此部件类型(前置条件/测试步骤/预期结果)
		if (title.indexOf("前置条件") == 0){
			part["condition"] = title.substr(5,)
		}
		else if (title.indexOf("预期结果") == 0){
			part["expected"] = title.substr(5,)
		}
		else if (title.indexOf("优先级") == 0){
			part["priority"] = title.substr(4,)
		}
		else{
			part["action"] = title
		}
		return part

	}else{  // 有子节点时
			// 如果子节点是步骤部件，则本节点是测试标题
			if (children[0]['children'].length == 0){
				testcase = {}
				testcase["title"] = data['title']
				parts = []
				for (var d of children){
						part = json2testsuit(d)
						parts.push(part)
					}
				testcase['steps'] = parts2steps(parts)
				testcase['module'] = module
				testsuit.push(testcase)
			}
			// 如果子节点还有子节点，继续爬行
			else{
				let m = module + '\\' + data['title']
				for (var d of children){
					json2testsuit(d, m)
				}
			}
		}
}


var x2e = function (xmindFile, excelFile) {
    //return new Promise(function (resolve, reject) {
		try{
			print('read the xmind file...')
			data = readXmind(xmindFile)
			print('OK\n\ntransfer the Xmind to Json...')
			data = JSON.parse(data)

			print('OK\n\nFormat the Json to testsuit...')
			json2testsuit(data, '')

			print('OK\n\nFormat the testsuit to excel data...')
			data = testsuit2excel()

			print('OK\n\nwrite the data to excel...')
			write2excel(excelFile, data)

			print('OK\n\n*** All is OK ***')
			//resolve(true)
			return data
		}
		catch(err){
		//reject('处理 xmind 错误')
		return false
		}
	//})
}


if (require.main === module) {
	// 输入 Xmind 文件名
	var args = process.argv.splice(2)
	xmindFile = args[0] + ".xmind"
	excelFile = args[0] + ".xlsx"
	x2e(xmindFile, excelFile)
}

module.exports.x2e=x2e
