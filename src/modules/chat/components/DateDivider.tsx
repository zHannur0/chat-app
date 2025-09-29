import { formatDateDivider } from "@/shared/lib/utils";

interface DateDividerProps {
    date: string;
  }
  
const DateDivider = ({ date }: DateDividerProps) => {
    return (
      <div className="flex w-full items-center justify-center my-2 text-inverse/50 gap-2">
        <hr className="flex-1" />
        <p>
          {formatDateDivider(date)}
        </p>
        <hr className="flex-1" />
      </div>
    );
};  

export default DateDivider;