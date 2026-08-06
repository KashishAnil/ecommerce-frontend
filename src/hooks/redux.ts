import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";

/** Typed Redux hooks so TypeScript knows about auth state. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
