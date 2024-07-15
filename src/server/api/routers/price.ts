import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  createTRPCRouter,
  publicProcedure,
  TRPCError,
} from "~/server/api/trpc";



interface Context {
  db: PrismaClient;
}

interface HistoryItem {
  dateId: number | null;
  price: number | null;
  dateData: {
    dateValue: Date;
  }
}

type CalendarDate = {
  id: number;
};

interface AveragePriceResult {
  averagePrice: number;
}

// function to get the IDs for a given day
async function dateIdsForDay(ctx: Context, year: number, month: number, day: number): Promise<number[]> {
  const dateRecords: CalendarDate[] = await ctx.db.calendarDate.findMany({
    select: {
      id: true,
    },
    where: {
      day: day,
      month: month,
      year: year,
    }
  });

  return dateRecords.map((record: CalendarDate) => record.id);
}


// function to get hourly prices for a specific day
async function HistoryDayResults(ctx: Context, year: number, month: number, day: number) {
  const dateIds = await dateIdsForDay(ctx, year, month, day);
  const historicalData = await ctx.db.historicalElectricityWeather.findMany({
      where: {
      dateId: {
          in: dateIds,
      }
      },
      select: {
      dateId: true,
      price: true,
      dateData: {
          select: {
          dateValue: true,
          }
      }
      }
  });
  return historicalData;
}

async function ForecastDayResults(ctx: Context, year: number, month: number, day: number) {
  const dateIds = await dateIdsForDay(ctx, year, month, day);
  const forecastData = await ctx.db.forecastElectricityPrice.findMany({
    where: {
      dateId: {
        in: dateIds,
      }
    },
    select: {
      dateId: true,
      price: true,
      dateData: {
        select: {
          dateValue: true,
        }
      }
    }
  });
  return forecastData;
}


// get the average price for each day in the given period
// The function works for both History and Forecast data based on the type parameter
async function getDailyAverage(ctx: Context, startDate: Date, endDate: Date, type: string) {
  const currentDate = new Date(startDate);
  const averagePrices = [];
  while(currentDate <= new Date(endDate)) {
    let resultData: HistoryItem[] = [];
    if(type === 'history') {
      resultData = await HistoryDayResults(ctx, currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    } else if (type === 'forecast') {
      resultData = await ForecastDayResults(ctx, currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    }

    if(resultData && resultData.length > 0) {
      let averagePrice = resultData.reduce((sum, obj) => {
        if (obj?.price !== null) {
          return sum + obj.price;
        } else {
          return sum;
        }
      }, 0);
      averagePrice = averagePrice / resultData.length;
      averagePrices.push({
        date: currentDate.getDate()+ '.' + (currentDate.getMonth()+1) + '.' + currentDate.getFullYear(),
        price: averagePrice
      });
    } else {
      averagePrices.push({
        date: currentDate.getDate()+ '.' + (currentDate.getMonth()+1) + '.' + currentDate.getFullYear(),
        price: null
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return averagePrices;
}


export const priceRouter = createTRPCRouter({    

    // get history data for a given day
    getHistoryDay: publicProcedure
        .input(z.object({ date: z.object({ day: z.number(), month: z.number(), year: z.number() }) }))
        .query(async ({ input, ctx }) => {
          try {
            const historicalData = await HistoryDayResults(ctx, input.date.year, input.date.month, input.date.day);

            return historicalData;
          } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
          }
            
        }),

    getForecastDay: publicProcedure
        .input(z.object({ date: z.object({ day: z.number(), month: z.number(), year: z.number() }) }))
        .query(async ({ input, ctx }) => {
          try {
            const forecastData = await ForecastDayResults(ctx, input.date.year, input.date.month, input.date.day);

            return forecastData;
          } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
          }
        }),

    getHistoryPeriodDailyAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {
          try {
            const averagePrices = await getDailyAverage(ctx, input.startDate, input.endDate, 'history');
            return averagePrices;
          } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
          }
          
        }),


    getForecastPeriodDailyAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {
          try {
            const averagePrices = await getDailyAverage(ctx, input.startDate, input.endDate, 'forecast');
            return averagePrices;
          } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
          }
          
        }),


    getHistoryPeriodTotalAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {

          try {
            const startDate = input.startDate.toISOString().slice(0, 19).replace('T', ' ');
            const endDate = input.endDate.toISOString().slice(0, 19).replace('T', ' ');

            const averagePriceResult: AveragePriceResult[] = await ctx.db.$queryRaw`
              SELECT AVG(price) AS averagePrice
              FROM (
                SELECT main.HistoricalElectricityWeather.price 
                FROM main.HistoricalElectricityWeather 
                LEFT JOIN main.CalendarDate AS cd 
                ON cd.id = main.HistoricalElectricityWeather.dateId 
                WHERE cd.dateValue >= ${startDate} AND cd.dateValue <= ${endDate}
              )`;

            const averagePrice = averagePriceResult[0]?.averagePrice ?? null;

            return { averagePrice };
          } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong" });
          }

          
        }),




    

    
    



});
