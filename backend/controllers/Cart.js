/**
 * @filename  : Cart.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Cart DB연동
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

    //데이터 조회
    router.get('/cart', async (req, res, next) => {

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        let sessionInfo = req.session.memberInfo

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 장바구니 전체 데이터 조회
            let sql2 = 'SELECT c.cart_code, c.product_count, p.product_name, p.product_price, p.product_img, m.member_id FROM carts c';
                sql2 += ' INNER JOIN products p ON c.product_code = p.product_code';
                sql2 += ' INNER JOIN members m ON c.member_code = m.member_code';
                sql2 += ' WHERE c.member_code = ?';

            const [result2] = await dbcon.query(sql2, sessionInfo.member_code);  //sessionInfo.member_code

            json = result2;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({'item': json });
    });

    // 데이터 추가
    router.post('/cart', async (req, res, next) => {

        const ctPdCnt = req.post('product_count');
        const ctPdCode = req.post('product_code');
        const ctMemCode = req.post('member_code');

        logger.debug(`카트상품개수 ${ctPdCnt}`)
        logger.debug(`카트상품코드 ${ctPdCode}`)
        logger.debug(`카트멤버코드 ${ctMemCode}`)

/*         try {
            regexHelper.value(ctPdCnt, '수량을 선택해주세요.');
            regexHelper.value(ctPdCode, '상품을 선택해주세요.');
        } catch (err) {
            return next(err);
        } */

        let json = null;

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장
            const sql1 = 'INSERT INTO carts (product_count, product_code, member_code) values (?, ?, ?)';
            const input_data = [ctPdCnt, ctPdCode, ctMemCode];
            const [result1] = await dbcon.query(sql1, input_data);

            // 저장한 데이터를 출력
            // let sql2 = "c.cart_code, product_count, p.product_name, m.member_id FROM carts c";
            //     sql2 += " INNER JOIN products p ON c.product_code = p.product_code";
            //     sql2 += " INNER JOIN members m ON c.member_code = m.member_code";
            //     sql2 += " WHERE m.member_id = ?";
            // const [result2] = await dbcon.query(sql2, 'woody')

            // json = result2;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ 'item': json });

    });


    // 데이터 수정
    router.put('/cart/:no', async (req, res, next) => {
        const ctCode = req.get('no');
        const ctPdCnt = req.post('product_count');
        const ctPdCode = req.post('product_code');
        const ctMemCode = req.post('member_code');

        if (ctCode === null || ctPdCnt === null || ctPdCode === null || ctMemCode === null) {
            return next(new Error(400));
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'UPDATE carts SET product_count=?, product_code=?, member_code=? WHERE cart_code=?'
            const input_data = [ctPdCnt, ctPdCode, ctMemCode, ctCode];
            const [result1] = await dbcon.query(sql, input_data);

            if (result1.affectedRows < 1) {
                throw new Error(' 수정된 데이터가 없습니다. ');
            }

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'item': json });
    });


    // 데이터 삭제
    router.delete('/cart/:no', async (req, res, next) => {
        const ctCode = req.get('no');

        if (ctCode === null) {
            return next(new Error(400));
        }

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'DELETE FROM carts WHERE cart_code = ?'

            const [result1] = await dbcon.query(sql, ctCode);


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