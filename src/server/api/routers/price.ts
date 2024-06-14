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


// function to get the IDs for a given period
/*async function dateIdsForPeriod(ctx: Context, startDate: string, endDate: string): Promise<number[]> {

  // Construct the SQL query with placeholders for dates
  const sql = Prisma.sql`
    SELECT id
    FROM CalendarDate
    WHERE dateValue >= ${startDate} AND dateValue <= ${endDate};
  `;


   // Debugging: Log the SQL and parameters
   console.log('SQL Query:', sql);
   console.log('Start Date:', startDate);
   console.log('End Date:', endDate);

  // Execute the SQL query with escaped parameters, even if dates come from code
  const result: { id: number }[] = await ctx.db.$queryRaw(sql, startDate, endDate);

  // Assuming the result contains an array of objects with 'id' property
  return result.map((record: any) => record.id);

}*/


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


    // get history data for a given period
    getHistoryPeriodDailyAverage: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ input, ctx }) => {
          let currentDate = new Date(input.startDate);
          const averagePrices = [];
          while(currentDate <= new Date(input.endDate)) {
            const historicalData = await HistoryDayResults(ctx, currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
            if(historicalData && historicalData.length > 0) {
              let averagePrice = historicalData.reduce((sum, obj) => {
                return sum + (obj?.price as number) ?? 0;
              }, 0);
              averagePrice = averagePrice / historicalData.length;
              averagePrices.push({
                date: currentDate.toISOString(),
                price: averagePrice
              });
            } else {
              averagePrices.push({
                date: currentDate.toISOString(),
                price: null
              });
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return averagePrices;
        }),

    // test fetching ids between two days
    /*getHistoryPeriodIds: publicProcedure
        .input(z.object({ startDate: z.string(), endDate: z.string() }))
        .query(async ({ input, ctx }) => {
          const dateIds = await dateIdsForPeriod(ctx, input.startDate, input.endDate);
            return dateIds;
        }),*/


    /*getHistoryPeriod: publicProcedure
        .input(z.object({ startDate: z.string(), endDate: z.string() }))
        .query(async ({ input, ctx }) => {
          const dateIds = await dateIdsForPeriod(ctx, input.startDate, input.endDate);
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
          }),*/



    

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
