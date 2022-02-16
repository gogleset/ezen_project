/**
 * @filename  : UtillHelper.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : 페이지번호 구현을 위한 모듈
 **/
const os = require("os");

module.exports.myip = () => {
    const ipAddress = [];
    const nets = os.networkInterfaces();

    for (const attr in nets) {
        const item = nets[attr];

        item.map((v, i) => {
            if (v.family == "IPv4" && v.address != "127.0.0.1") {
                ipAddress.push(v.address);
            }
        })
    }
    return ipAddress;
};

module.exports.pagenation = function(totalCount = 0, nowPage = 1, listCount = 10, groupCount = 5) {
    totalCount = isNaN(totalCount) ? 0 : parseInt(totalCount);
    nowPage = isNaN(nowPage) ? 1 : parseInt(nowPage);
    listCount = isNaN(listCount) ? 10 : parseInt(listCount);
    groupCount = isNaN(groupCount) ? 5 : parseInt(groupCount);

    var totalPage = parseInt(((totalCount - 1) / listCount)) + 1;
    var totalGroup = parseInt(((totalPage) - 1) / (groupCount)) + 1;
    var nowGroup = parseInt(((nowPage - 1) / groupCount)) + 1;
    var groupStart = parseInt(((nowGroup - 1) * groupCount)) + 1;
    var groupEnd = Math.min(totalPage, nowGroup * groupCount);

    var prevGroupLastPage = 0;
    if (groupStart > groupCount) {
        prevGroupLastPage = groupStart - 1;
    }

    var nextGroupFirstPage = 0;
    if (groupEnd < totalPage) {
        nextGroupFirstPage = groupEnd + 1;
    }

    var offset = (nowPage - 1) * listCount

    return {
        nowPage: nowPage,
        totalCount: totalCount,
        listCount: listCount,
        tatalPage: totalPage,
        groupCount: groupCount,
        totalGroup: totalGroup,
        nowGroup: nowGroup,
        groupStart: groupStart,
        groupEnd: groupEnd,
        prevGroupLastPage: prevGroupLastPage,
        nextGroupFirstPage: nextGroupFirstPage,
        offset: offset
    };
};