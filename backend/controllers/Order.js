/**
 * @filename  : Order.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Order DB연동
 **/

/** 모듈 참조 */
const axios = require("axios");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const logger = require('../helper/LogHelper');
const config = require('../helper/_config');
const utilHelper = require('../helper/UtillHelper');
const regexHelper = require("../helper/regex_helper.js");


module.exports = (app) => {
    let dbcon = null;

    

    //데이터 조회 [주문서 작성 페이지에서 출력할 DT]
    router.get('/basket', async (req, res, next) => {

        // 검색어 파라미터 받기
        const query = req.get('query');
        // 현재 페이지 번호 받기 (기본값 : 1)
        const page = req.get('page', 1);
        // 한 페이지에 보여질 목록 수 (기본값 : 10)
        const rows = req.get('rows', 10);
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        let pagenation = null;

        let sessionInfo = req.session.memberInfo

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 장바구니 전체 데이터수 조회 - 페이지 번호구현에 쓰일DT
            let sql1 = 'SELECT COUNT(*) AS cnt FROM orders WHERE member_code = ?'

            const [result1] = await dbcon.query(sql1, sessionInfo.member_code);
            const totalCount = result1[0].cnt;

            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));


            // 장바구니 전체 데이터 조회
            let sql2 = 'SELECT c.product_code, c.product_count, p.product_price, p.product_name, p.product_img, m.member_name, m.member_phone, m.member_postcode, m.member_addr1, m.member_addr2';
                sql2 += ' FROM carts c';
                sql2 += ' INNER JOIN products p ON c.product_code = p.product_code';
                sql2 += ' INNER JOIN members m ON c.member_code = m.member_code';
                sql2 += ' WHERE member_code = ?';

            sql2 += " LIMIT ?, ?";
            args2.push(pagenation.offset);
            args2.push(pagenation.listCount);

            const [result2] = await dbcon.query(sql2, sessionInfo.member_code);

            json = result2;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'pagenation': pagenation, 'item': json });
    });

    // orders 테이블 데이터 추가 [ 주문 결제 성공 시 저장 될 DT ]
    router.post('/order', async (req, res, next) => {

        const merchantUid = req.post('merchant_uid');
        const orderState = req.post('order_state');
        const orderDate = req.post('order_date');
        const orderTtPrice = req.post('order_total_price');
        const rcvNm = req.post('receiver_name');
        const rcvPhone = req.post('receiver_phone');
        const rcvAddr1 = req.post('receiver_addr1');
        const rcvAddr2 = req.post('receiver_addr2');
        const rcvAddr3 = req.post('receiver_addr3');
        const memberCode = req.post('member_code');
        const impUid = req.post('imp_uid');
        const odPdCnt = req.post('product_count');
        const odPdPrice = req.post('product_price');
        const odPdCode = req.post('product_code');
        const odOdcode = req.post('order_code');
        

        try {
            regexHelper.value(orderTtPrice, '값을 넣어주세요.');
        } catch (err) {
            return next(err);
        }

        let json = null;

        let data = null;

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장
            const sql1 = 'INSERT INTO orders (merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, member_code, imp_uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const input_data1 = [merchantUid, orderState, orderDate, orderTtPrice, rcvNm, rcvPhone, rcvAddr1, rcvAddr2, rcvAddr3, memberCode, impUid];
            const [result1] = await dbcon.query(sql1, input_data1);


            const sql2 = 'INSERT INTO order_details (product_count, product_price, product_code, order_code) VALUES (?, ?, ?, ?)'
            const input_data2 = [odPdCnt, odPdPrice, odPdCode, odOdcode]
            const [result2] = await dbcon.query(sql2, input_data2);

            // 저장한 데이터를 출력
            let sql3 = "merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, member_code, imp_uid FROM orders WHERE member_id = ?";
            const [result3] = await dbcon.query(sql3, sessionInfo.member_id)

            json = result3;

            let sql4 = "d_product_count, product_price, product_code, o_order_code FROM order_details d INNER JOIN orders o ON d.order_code = o.order_code WHERE order_code =?";
            const [result4] = await dbcon.query(sql4, result3.order_code);

            data = result4

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ 'item': json , 'data': data});

    });

    // 데이터 수정 => 주문 취소 완료  //*수정되어야 할 항목 : orderState (주문 상태) Y -> C *//
    router.put('/cancel/:no', async (req, res, next) => {

        let sessionInfo = req.session.memberInfo

        const merchantUid = req.post('merchant_uid');
        const orderState = req.post('order_state');
        const orderDate = req.post('order_date');
        const orderTtPrice = req.post('order_total_price');
        const rcvNm = req.post('receiver_name');
        const rcvPhone = req.post('receiver_phone');
        const rcvAddr1 = req.post('receiver_addr1');
        const rcvAddr2 = req.post('receiver_addr2');
        const rcvAddr3 = req.post('receiver_addr3');
        const memberCode = req.post('member_code');
        const impUid = req.post('imp_uid');

        if (merchantUid === null || impUid === null) {
            return next(new Error(400));
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql1 = 'UPDATE carts SET order_state=? WHERE member_code = ?'
            const input_data = [orderState, memberInfo.member_code];
            const [result1] = await dbcon.query(sql1, input_data);

            if (result1.affectedRows < 1) {
                throw new Error(' 수정된 데이터가 없습니다. ');
            }

            // 저장한 데이터를 출력
            let sql2 = "merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, member_code, imp_uid FROM orders WHERE member_id = ?";
            const [result2] = await dbcon.query(sql2, sessionInfo.member_id)

            json = result2;

            let sql3 = "d_product_count, product_price, product_code, o_order_code FROM order_details d INNER JOIN orders o ON d.order_code = o.order_code WHERE order_code =?";
            const [result3] = await dbcon.query(sql3, result3.order_code);

            data = result3

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'item': json , 'data': data});
    });


    // 카트에서 데이터 삭제 [ 주문 결제 성공 시 카트 상품 DELETE ]
    router.delete('/basket/:no', async (req, res, next) => {

        let sessionInfo = req.session.memberInfo

        const memberCode = req.get('no');
        console.log(memberCode)

        if (memberCode === null) {
            return next(new Error(400));
        }

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql1 = 'DELETE FROM carts WHERE member_code = ?'
            const [result1] = await dbcon.query(sql1, memberInfo.member_code);


            if (result1.affectedRows < 1) {
                throw new Error('삭제된 데이터가 없습니다');
            }

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson();
    });    

    return router;
};