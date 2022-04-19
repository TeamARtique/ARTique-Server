import { Request, Response } from "express";
import userService from "../../service/userService";
import exhibitionService from "../../service/exhibitionService";
import likeService from "../../service/likeService";
import bookmarkService from "../../service/bookmarkService";
const db = require('../../db/db');
const responseMessage = require("../../constants/responseMessage");
const statusCode = require("../../constants/statusCode");
const util = require("../../lib/util");

/**
 *  @route GET /exhibition/:exhibitionId
 *  @desc GET exhibition detail data (전시 상세조회) 
 *  @access Private
 */
export default async (req: Request, res: Response) => {
    let client: any;
    let exhibitionId = parseInt(req.params.exhibitionId);
    let userId = req.body.user.id;
    
    try {
        client = await db.connect(req);
        const exhibitionDetailData = await exhibitionService.getDetailExhibition(client, exhibitionId, userId);
        const likeCount = await likeService.getLikeCount(client, exhibitionId);
        const isLiked = await likeService.getIsLiked(client, exhibitionId, userId); 
        const bookmarkCount = await bookmarkService.getBookmarkCount(client, exhibitionId);
        const isBookmarked = await bookmarkService.getIsBookmarked(client, exhibitionId, userId); 
        let artistData = await userService.findUserById(client, exhibitionDetailData.userId);

        let finalData = {
            exhibition: {
                exhibitionId: exhibitionDetailData.id,
                title: exhibitionDetailData.title,
                posterImage: exhibitionDetailData.posterImage,
                posterTheme: exhibitionDetailData.posterTheme,
                description: exhibitionDetailData.description,
                isPublic: exhibitionDetailData.isPublic,
                createdAt: exhibitionDetailData.createdAt,
            },
            artist: {
                artistId: exhibitionDetailData.userId,
                isWriter: userId == exhibitionDetailData.userId ? true : false,
                nickname: artistData.nickname,
            },
            like: {
                isLiked: isLiked.isLiked == 1? true : false,
                likeCount: parseInt(likeCount.likeCount)
            },
            bookmark: {
                isBookmarked: isBookmarked.isLiked == 1? true : false,
                bookmarkCount: parseInt(bookmarkCount.bookmarkCount)
            }
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_EXHIBITION_MAIN_SUCCESS, finalData));
    } catch (error) {
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    } 
    finally {
        client.release();
    } 
}; 