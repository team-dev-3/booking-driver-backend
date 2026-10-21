import {Response, Request} from 'express'
import { prisma } from '../../config/database'

export const bookingList = async(req: Request, res: Response)=>{
    try{
        const totalBooking = await prisma.booking.count()
        const bookingProcessing = await prisma.booking.count({
            where: {
                status: {
                    in: ["DRIVER_ASSIGNED", "FINDING_DRIVER", "IN_PROGRESS","PENDING_PAYMENT"]
                }
            }
        })
        const bookingDone = await prisma.booking.count({
            where: {
                status: "COMPLETED"
            }
        })
        const fare = await prisma.booking.aggregate({
            _sum: {
                totalFare: true
            },
            where: {
                status: "COMPLETED"
            }
        })
        const revenue = Number(fare._sum.totalFare || 0);

        const bookings = await prisma.booking.findMany({
            orderBy: {
                createdAt: 'desc', 
            },
            select: {
                id: true,               
                bookingCode: true,    
                passengerName: true,   
                passengerPhone: true,  
                totalFare: true,       
                status: true,        
                schedule: {
                    select: {
                        departureTime: true, 
                        route: {
                            select: {
                                routeName: true, 
                            },
                        },
                    },
                },
            },
        });
        const dataFinal = []
        for (const item of bookings) {
            dataFinal.push({
                id: item.id.toString(),                     // ID để làm nút "Chi tiết ->"
                bookingCode: item.bookingCode,              // MÃ ĐƠN (GM001, GM002...)
                customerName: item.passengerName,           // KHÁCH HÀNG (Tên)
                customerPhone: item.passengerPhone,         // KHÁCH HÀNG (SĐT)
                routeName: item.schedule?.route?.routeName, // TUYẾN ĐƯỜNG (Hà Nội → Hải Phòng)
                departureTime: item.schedule?.departureTime,// KHỞI HÀNH (Giờ xe chạy)
                totalFare: Number(item.totalFare),          // TỔNG TIỀN (400.000)
                status: item.status,                        // TRẠNG THÁI (Đã xác nhận, Hoàn thành...)
            });
        }
        return res.json({
            success: true,
            message: "Lấy danh sách đơn thành công",
            data: dataFinal,
            totalBooking: totalBooking,
            bookingProcessing: bookingProcessing,
            bookingDone: bookingDone,
            revenue: revenue,
        })
    }catch(error){
        console.log(error)
        res.json({
            success: false,
            message: "Lấy danh sách đơn thất bại"
        })
    }
}

export const bookingCreatePost = async (req: Request, res: Response) => {
    try {
        const {fixedScheduleId, passengerName, passengerPhone, seatCount, serviceType, pickupAddress, dropoffAddress, isHighway, paymentMethod, customerNote} = req.body
        const fixedSchedule = await prisma.fixedSchedule.findUnique({
            where: {
                id: fixedScheduleId
            }
        })
        const route = await prisma.route.findUnique({
            where: {
                id: fixedSchedule?.routeId
            }
        })
        const routeCode = route?.routeCode

        const vehicle = await prisma.vehicle.findUnique({
            where: {
                id: fixedSchedule?.vehicleId
            }
        })
        const vehicleType = vehicle?.vehicleType

        if(!fixedSchedule){
            res.json({
                success: false,
                message: "Không tìm thấy tuyến xe!"
            })
            return
        }
        const now = new Date();
        const departureTime = new Date(fixedSchedule.departureTime);

        if (departureTime <= now) {
            res.json({
                success: false,
                message: "Không thể đặt vé cho chuyến xe đã khởi hành!",
            });
            return;
        }

        if(seatCount > fixedSchedule.availableSeats){
            res.json({
                success: false,
                message: "Số ghế đặt lớn hơn số ghế còn trống!"
            })
            return
        }


        
        

        


    } catch (error) {
        
    }
}