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
  dateId: number;
  price: number;
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


    // get average prices daily for a given period
    getHistoryPeriodDailyAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {
          let currentDate = new Date(input.startDate);
          const averagePrices = [];
          // get the average price for each day in the given period
          while(currentDate <= new Date(input.endDate)) {
            const historicalData = await HistoryDayResults(ctx, currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
            if(historicalData && historicalData.length > 0) {
              let averagePrice = historicalData.reduce((sum, obj) => {
                return sum + (obj?.price as number) ?? 0;
              }, 0);
              averagePrice = averagePrice / historicalData.length;
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
        }),



    

    // get forecast data for a given day
    getForecastDay: publicProcedure
        .input(z.object({ date: z.object({ day: z.number(), month: z.number(), year: z.number() }) }))
        .query(async ({ input, ctx }) => {
            return ctx.db.forecastElectricityPrice.findMany({
                where: {
                dateId: {
                    in: await dateIdsForDay(ctx, input.date.year, input.date.month, input.date.day),
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
        }),



});
