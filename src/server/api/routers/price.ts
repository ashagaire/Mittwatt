import { date, z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { get } from "http";



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
  let currentDate = new Date(startDate);
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
        if (obj && obj.price !== null) {
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
    hello: publicProcedure
        .input(z.object({ text: z.string() }))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text}`,
            };
        }),    

    // get history data for a given day
    getHistoryDay: publicProcedure
        .input(z.object({ date: z.object({ day: z.number(), month: z.number(), year: z.number() }) }))
        .query(async ({ input, ctx }) => {
            const historicalData = await HistoryDayResults(ctx, input.date.year, input.date.month, input.date.day);

            return historicalData;
        }),

    getForecastDay: publicProcedure
        .input(z.object({ date: z.object({ day: z.number(), month: z.number(), year: z.number() }) }))
        .query(async ({ input, ctx }) => {
          const forecastData = await ForecastDayResults(ctx, input.date.year, input.date.month, input.date.day);

          return forecastData;
        }),

    getHistoryPeriodDailyAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {
          const averagePrices = await getDailyAverage(ctx, input.startDate, input.endDate, 'history');
          return averagePrices;
        }),


    getForecastPeriodDailyAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {
          const averagePrices = await getDailyAverage(ctx, input.startDate, input.endDate, 'forecast');
          return averagePrices;
        }),


    // get average prices daily for a given period





    

    
    



});
