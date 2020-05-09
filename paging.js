/**
 * [分页栏组件 主要用于native-editable的分页]
 * @Author   Oliver
 * @DateTime 2020-4-15
 * @version  [1.0]
 * @Remark  主要采用异步回调进行初始化的模式
 * 1、兼容同页面多组件模式
 * 2、避免传统翻页搜索导致当前页码未重置bug
 * @type {[type]}
 */
var tableStyle =
    ".page {font-size: 14px;background-color: transparent;width: 100%;height: 50px;line-height: 50px;display: block;-webkit-user-select:none;-moz-user-select:none; -ms-user-select:none;user-select:none;}" +
    ".page .page-l select {width: 60px;height: 30px;}" +
    ".page .page-l .page-size-box {display: inline-block;margin-left: 20px;}" +
    ".page .page-r {float: right;padding-top: 10px;margin-right: 100px;}" +
    ".page .page-r ul {float: left;list-style: none;margin: 0;height: 30px;box-sizing: border-box;padding: 0;}" +
    ".page .page-r ul li {float: left;list-style: none;height: 100%;line-height: 30px;border: 1px solid #ccc;box-sizing: border-box;margin:0 2px;}" +
    ".page .page-r ul li.active {background-color:#50aaff;border:1px solid #50aaff;}" +
    ".page .page-r ul li.active a:hover {background-color:#50aaff;}" +
    ".page .page-r ul li.active a {color: #fff;}" +
    ".page .page-r ul li a:hover {background-color: #f5f2f2;}" +
    ".page .page-r ul li:last-child {border-right: 1px solid #ccc;}" +
    ".page .page-r ul li a {line-height: inherit;text-decoration: none;display: block;height: 100%;color: #777;text-align:center;cursor:pointer;}" +
    ".page .page-r ul li.p1 a,.page .page-r ul li.p2 a,.page .page-r ul li.p3 a {width:30px;}" +
    ".page .page-r ul li.p4 a {width:40px;}" +
    ".page .page-r ul li.p5 a {width:50px;}" +
    ".page .page-r ul li.p6 a {width:60px;}" +
    ".page .page-r ul li a.active {background-color: #09aeb0;color: #fff;}" +
    ".page .page-r ul li a.ellipsis {cursor: not-allowed;}";

var styleNode = document.createElement('style');
styleNode.innerHTML = tableStyle;
var headNode = document.getElementsByTagName('head')[0];
headNode.appendChild(styleNode);
// render pagination (pagination's el，table's el，isShow["true","false"])
function initPagination(pageEl,el,isShow){
    var renderHtml = '<div class="page"><div class="page-l"id="page_l'+el+'"style="float: left;width:30%;"><span>总共<span id="total_count'+el+'"></span>条</span><div class="page-size-box"><span>每页显示</span><select id="page_size'+el+'"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="50">50</option><option value="100">100</option><option value="200">200</option></select>条</div></div><div class="page-r" style="width:50%;"><ul id="page_ul'+el+'"class="page-ul"></ul></div></div>';
    if(isShow=="true"){
        $("#"+pageEl).html(renderHtml);
    }else{
        $("#"+pageEl).html("");
    }
}
// init page
function Paging(pageConfig,el, callback) {
    this.pageSize = pageConfig.pageSize || 10;
    this.pageIndex = pageConfig.pageIndex || 1;
    this.totalCount = pageConfig.totalCount || 0;
    this.totalPage = Math.ceil(pageConfig.totalCount / pageConfig.pageSize) || 0;
    this.prevPage = pageConfig.prevPage || '<';
    this.nextPage = pageConfig.nextPage || '>';
    this.degeCount = pageConfig.degeCount || 3;
    this.ellipsis = pageConfig.ellipsis;
    this.ellipsisBtn = (pageConfig.ellipsis == true || pageConfig.ellipsis == null) ? '<li class="p1"><a class="ellipsis">…</a></li>' : '';
    var that = this;
    $('#page_size'+el).val(this.pageSize);
    callback && callback(this.pageIndex, this.pageSize);
    // render templ
    this.initPage = function(totalCount, totalPage,pageIndex,el){
        this.totalCount = totalCount;
        this.totalPage = totalPage;
        this.pageIndex = pageIndex;
        var degeCount = this.degeCount;
        var pageHtml = '';
        var tmpHtmlPrev = ''; 
        var tmpHtmlNext = '';
        var headHtml = '';
        var endHtml = '';
        var ellipsisBtn = this.ellipsisBtn;
        pageIndex = pageIndex - 0;
        var firstPage = '<li class="p1"><a class="page-number" href="javascript:;">1</a></li>';
        var lastPageCla = 'p' + (this.totalPage + '').length;
        var lastPage = '<li class="' + lastPageCla + '"><a class="page-number" href="javascript:;">' + this.totalPage + '</a></li>';
        var tmpHtmlPrev = '<li class="p1"><a id="prev_page'+el+'" class="p1">' + this.prevPage + '</a></li>';
        var tmpHtmlNext = '<li class="p1"><a id="next_page'+el+'" class="p1">' + this.nextPage + '</a></li>';
        var countPage = '';
        // control middle button ,all not need
        if (pageIndex <= (degeCount + 2) && (pageIndex + degeCount) >= (totalPage - 1)) {
            for (var i = 1; i <= totalPage; i++) {
                var len = (i + '').length;
                if (i == pageIndex) {
                    countPage += '<li class="active p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                } else {
                    countPage += '<li class="p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                }
            }
            pageHtml = tmpHtmlPrev + countPage + tmpHtmlNext;
        }
        // control middle button ,right need
        if (pageIndex <= (degeCount + 2) && (pageIndex + degeCount) < (totalPage - 1)) {
            for (var i = 1; i <= (degeCount * 2 + 2); i++) {
                var len = (i + '').length;
                if (i == pageIndex) {
                    countPage += '<li class="active p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                } else {
                    countPage += '<li class="p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                }
            }
            if (degeCount * 2 + 2 < totalPage) {
                pageHtml = tmpHtmlPrev + countPage + ellipsisBtn + lastPage + tmpHtmlNext;
            } else {
                pageHtml = tmpHtmlPrev + countPage + tmpHtmlNext;
            }
        }
        // control middle button ,all need
        if (pageIndex > (degeCount + 2) && (pageIndex + degeCount) < (totalPage - 1)) {
            for (var i = pageIndex - degeCount; i <= pageIndex + degeCount; i++) {
                var len = (i + '').length;
                if (i == pageIndex) {
                    countPage += '<li class="active p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                } else {
                    countPage += '<li class="p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                }
            }
            pageHtml = tmpHtmlPrev + firstPage + ellipsisBtn + countPage + ellipsisBtn + lastPage + tmpHtmlNext;
        }
        // control middle button ,left need
        if (pageIndex > (degeCount + 2) && (pageIndex + degeCount) >= (totalPage - 1)) {
            for (var i = (totalPage - degeCount * 2 - 1); i <= totalPage; i++) {
                var len = (i + '').length;
                if (i == pageIndex) {
                    countPage += '<li class="active p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                } else {
                    countPage += '<li class="p' + len + '"><a class="page-number" href="javascript:;">' + i + '</a></li>';
                }
            }
            if (totalPage - degeCount * 2 - 1 > 1) {
                pageHtml = tmpHtmlPrev + firstPage + ellipsisBtn + countPage + tmpHtmlNext;
            } else {
                pageHtml = tmpHtmlPrev + countPage + tmpHtmlNext;
            }
        }

        $('#page_ul'+el).html(pageHtml);
        $('#total_count'+el).html(totalCount);
        if (pageIndex == 1) {
            $('#page_ul'+el).find('#prev_page'+el).css('cursor', 'not-allowed');
        }
        if (pageIndex == totalPage) {
            $('#page_ul'+el).find('#next_page'+el).css('cursor', 'not-allowed');
        }
    };

    // click event
    $('#page_ul'+el).on('click', 'a', function(e) {
        var _this = $(this);
        var idAttr = _this.attr('id');
        var className = _this.attr('class');
        if (idAttr == 'prev_page'+el && that.pageIndex > 1) {
            // Previous page
            that.pageIndex = that.pageIndex - 1;
            callback && callback(that.pageIndex, that.pageSize);
        } else if (idAttr == 'next_page'+el && that.pageIndex < that.totalPage) {
            // next page
            that.pageIndex = parseInt(that.pageIndex) + 1;
            callback && callback(that.pageIndex, that.pageSize);
        } else if (className == 'page-number') { 
            // number page
            that.pageIndex = _this.html();
            callback && callback(that.pageIndex, that.pageSize);
        }

    });
    // render page dom
    $('#page_size'+el).change(function() {
        var _this = $(this);
        that.pageIndex = pageConfig.pageIndex = 1;
        that.pageSize = pageConfig.pageSize = _this.val() - 0;
        callback && callback(that.pageIndex, that.pageSize);
    })
}