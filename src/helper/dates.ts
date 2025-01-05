import * as moment from "moment";
import { unitOfTime } from "moment";
import { BetDaysEntity } from "../modules/bet-days/entities/bet-days.entity";

export const isAfter = (
    start: moment.Moment | string | Date,
    end: moment.Moment | string | Date,
    startOf?: unitOfTime.StartOf,
) => {
    if (!startOf) return moment(start).isAfter(moment(end));
    else return moment(start).startOf(startOf).isAfter(moment(end).startOf(startOf));
}

export const isBefore = (
    start: moment.Moment | string | Date,
    end: moment.Moment | string | Date,
    startOf?: unitOfTime.StartOf,
) => {
    if (!startOf) return moment(start).isBefore(moment(end));
    else return moment(start).startOf(startOf).isBefore(moment(end).startOf(startOf));
}

export const validateDaysComplete = (betDays: Array<BetDaysEntity>, today: moment.Moment) => {
    return betDays.filter(
        (betDay) =>
            today.startOf('day').isAfter(moment(betDay.day)) &&
            (today.format('DD') !== moment(betDay.day).format('DD') ||
                (today.format('MM') !== moment(betDay.day).format('MM') &&
                    today.format('DD') === moment(betDay.day).format('DD')))
    );
}