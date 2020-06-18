﻿(function(){
    /*-----------要加入一个新项，只需在对应的地方加上一个项，-----------*/
    /*-----------并补上其相对于根目录的相对地址，以及其名称-----------*/
    var nav=[
        {href:"index.html",text:"Home Page"},
        {href:"./Build/Documentation/index.html",text:"Class Reference"},
        {href:"./examples/examples.html",text:"Sample Code"},
        {href:"http://www.supermapol.com/earth/",text:"SuperMapEarth"},
        //{href:"./demo/demo.html",text:"Demo"},
		{href:"",text:"Technical Topic",dropdown:[
            {href:"./examples/TopicDoc/FlyManagerTopic.html",text:"Fly Manager Introduction"},
			{href:"./examples/TopicDoc/LoadObliqueModel_OperateTopic.html",text:"Manual to Load Oblique Image Model"},
			{href:"./examples/TopicDoc/LoadObliqueModel_OperateTopic.html",text:"Query Attributes Value of Oblique Image Model"},
			{href:"./examples/TopicDoc/LoadTerrain_OperateTopic.html",text:"Manual to Load Terrain Data"},
			{href:"./examples/TopicDoc/LoadGltfModel_OperateTopic.html",text:"Instructions for Loading gltf"},
			{href:"./examples/TopicDoc/LoadImagery_OperateTopic.html",text:"Load Image Data"},
			{href:"./examples/TopicDoc/LoadBIM_OperateTopic.html",text:"Load BIM And Fine Model"}
			]},
			{href:"./downloads.html",text:"Download"},
            {href:"./webglreport.html",text:"WebGL"}
    ];

    var _getScriptLocation=(function() {
        var r = new RegExp("(^|(.*?\\/))(js/navbar.js)(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for(var i=0, len=s.length; i<len; i++) {
            src = s[i].getAttribute('src');
            if(src) {
                var m = src.match(r);
                if(m) {
                    l = m[1];
                    break;
                }
            }
        }
        return (function() { return l; });
    })();

    var commonPath=commonPath=_getScriptLocation();
    commonPath=commonPath.indexOf("examples")>-1?commonPath.replace("examples","."):"../"+commonPath;

    var path00= commonPath+nav[0]["href"];
    var outer_head='<div class="navbar-inner">'+
        '<div class="container">'+
        '<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '<span class="icon-bar"></span>'+
        '</a>'+
        '<a class="brand" href="'+path00+'">WebGL API</a> '+
        '<div class="nav-collapse"> '+
        '<ul class="nav" id="titleContent"> ';
    var outer_foot='</ul>'+
        '</div>'+
        '</div>'+
        '</div> ';
    var inner="";
    for(var i=0;i<nav.length;i++)
    {
        var li=nav[i];
        if(li.dropdown==undefined)
        {
            var pathii=commonPath+li["href"];
            if(nav[i].text == 'SuperMapEarth'){
                pathii = li["href"];
                inner+='<li class=""><a href="'+pathii+'" target=blank>'+li["text"]+'</a></li>';
            }
            else{
                inner+='<li class=""><a href="'+pathii+'">'+li["text"]+'</a></li>';
            }

        }
        else
        {
            var h= '<li class="dropdown"> '+
                '<a class="dropdown-toggle" data-toggle="dropdown" href="">'+li["text"]+' <b class="caret"></b></a> '+
                '<ul class="dropdown-menu"> ';
            var f= '</ul>'+
                '</li>';
            var dropDown="";
            var d_li=li["dropdown"];
            for(var j=0;j<d_li.length;j++)
            {
                var pathjj=commonPath+d_li[j]["href"];
                if(d_li[j].dropdown==undefined)
                {
                    dropDown+='<li class=""><a href="'+pathjj+'">'+d_li[j]["text"]+'</a></li>';
                }
                else
                {
                    var h2= '<li class=""><a href="'+pathjj+'">'+d_li[j]["text"]+'</a>'+
                        '<ul > ';
                    var f2= '</ul>'+
                        '</li>';
                    var dropDown2="";
                    var d_li2=d_li[j]["dropdown"];
                    for(var k=0;k<d_li2.length;k++)
                    {
                        var pathkk=commonPath+d_li2[k]["href"];
                        dropDown2+='<li class=""><a href="'+pathkk+'">'+d_li2[k]["text"]+'</a></li>';
                    }
                    dropDown+=h2+dropDown2+f2;
                }
            }
            inner+=h+dropDown+f;
        }
    }


    var navHtml=outer_head +inner+outer_foot;
    var navElement=document.getElementById("navbar");
    navElement.innerHTML=navHtml;

    /*查找导航条中与打开的文档地址一致的文件，并将其对应的li标签的className改为active，以利用样式*/
    var all_li=navElement.getElementsByTagName("li");
    var path=window.location.href;
    for(var i=0;i<all_li.length;i++)
    {
        var a=all_li[i].childNodes[0];
        if(a&&a.href&&(path.indexOf(a.href)>-1|| (path.match(/-js\.html/)&& a.href.indexOf("apidoc/index.html")>-1)))
        {
            all_li[i].className="active";
        }
    }
})();
