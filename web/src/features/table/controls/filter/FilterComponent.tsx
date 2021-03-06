import FilterRow from "./FilterRow"
import DefaultButton from "../../../buttons/Button";
import classNames from "classnames";
import {
  Dismiss20Regular as RemoveIcon,
  AddSquare20Regular as AddFilterIcon,
  AddSquareMultiple20Regular as AddGroupIcon,
} from "@fluentui/react-icons";
import React from "react";
import TorqSelect, { SelectOptionType } from "../../../inputs/Select";

import styles from './filter_popover.module.scss';
import { useAppSelector } from "../../../../store/hooks";
import { selectAllColumns } from "../../tableSlice";
import { AndClause, OrClause, Clause, FilterClause } from "./filter";

const combinerOptions: SelectOptionType[] = [
  { value: "and", label: "And" },
  { value: "or", label: "Or" },
];

interface filterOptionsInterface {
  key: string;
  heading: string;
  valueType: string;
}

interface filterProps {
  filters: Clause
  onFilterUpdate: Function
  onNoChildrenLeft?: Function
  child?: boolean
}

const FilterComponent = ({ filters, onFilterUpdate, onNoChildrenLeft, child }: filterProps) => {

  const updateFilter = () => {
    onFilterUpdate()
  };

  const removeFilter = (index: number) => {
    filters = filters as AndClause | OrClause
    filters.childClauses.splice(index, 1)
    if (filters.childClauses.length === 1) {
      filters.prefix = "$and"
    }
    if (filters.childClauses.length === 0) {
      if (onNoChildrenLeft) {
        onNoChildrenLeft()
      }
    }
    onFilterUpdate()
  };

  const handleNoChildrenLeft = (index: number) => {
    return () => {
      removeFilter(index)
    }
  }

  const addFilter = () => {
    if (!filters) {
      filters = new AndClause()
    }
    filters = filters as AndClause | OrClause
    filters.addChildClause(new FilterClause(
      {
        funcName: "gte",
        category: "number",
        key: "capacity",
        parameter: 0
      }
    ))
    onFilterUpdate()
  };

  const addGroup = () => {
    if (!filters) {
      filters = new AndClause()
    }
    filters = filters as AndClause | OrClause
    filters.addChildClause(new AndClause([
      new FilterClause(
        {
          funcName: "gte",
          category: "number",
          key: "capacity",
          parameter: 0
        }
      )]))
    onFilterUpdate()
  };

  const handleCombinerChange = (combiner: any) => {
    if (combiner.value !== "and" && combiner.value !== "or") {
      throw new Error("Combiner should be either an AND or an OR")
    }
    // this effectively changes the type of the object from AndClause to OrClause or vice versa
    filters.prefix = combiner.value === "and" ? "$and" : "$or"
    onFilterUpdate()
  }

  const columnsMeta = useAppSelector(selectAllColumns) || [];


  let columnOptions = columnsMeta
    .slice()
    .map((column: filterOptionsInterface) => {
      return {
        value: column.key,
        label: column.heading,
        valueType: column.valueType
      };
    });

  columnOptions.sort((a: SelectOptionType, b: SelectOptionType) => {
    if (a.label < b.label) { return -1; }
    if (a.label > b.label) { return 1; }
    return 0;
  });


  const CombinerSelect = ({ index }: { index: number }) => {
    const combinerOption = combinerOptions.find(
      item => item.value === (filters.prefix === "$and" ? "and" : "or")
    )
    if (!combinerOption) {
      throw new Error("combiner not found")
    }

    switch (index) {
      case 0:
        return (
          <div className={styles.combinerContainer}>
            <div className={styles.combinerLabel}>Where</div>
            {/*Clean this up using grid named cells*/}
            <div className={classNames(styles.removeFilter, styles.mobileRemove)} onClick={() => removeFilter(index)}>
              <RemoveIcon />
            </div>
          </div>
        )
      case 1:
        return (
          <div className={styles.combinerContainer}>
            <TorqSelect
              options={combinerOptions}
              value={combinerOption}
              onChange={handleCombinerChange}
            />
            <div className={classNames(styles.removeFilter, styles.mobileRemove)} onClick={() => removeFilter(index)}>
              <RemoveIcon />
            </div>
          </div>
          )
      default:
        return <div className={styles.combinerLabel}>{filters.prefix === "$and" ? "And" : "Or"}</div>
    }

  }

  return (
    <div className={classNames({[styles.childFilter]: child})}>
      <div className={styles.filterRows}>

        {!filters.length && <div className={styles.noFilters}>No filters</div>}

        {(filters as AndClause | OrClause).childClauses.map((filter, index) => {
          if (filter.prefix === "$filter") {
            return (
              <div key={"filter-row-wrapper-" + index} className={classNames(styles.filterRow, { first: !index })}>

                <CombinerSelect index={index} />

                <FilterRow
                  key={"filter-row-" + index}
                  filterClause={filter as FilterClause}
                  index={index}
                  columnOptions={columnOptions}
                  onUpdateFilter={updateFilter}
                  onRemoveFilter={removeFilter}
                />

              </div>
            )
          } else {
            return (
              <div key={"filter-sub-group-" + index} className={classNames(styles.filterRow, {first: !index})}>

                <CombinerSelect index={index} />

                <FilterComponent
                  child={true}
                  filters={filter}
                  onNoChildrenLeft={handleNoChildrenLeft(index)}
                  onFilterUpdate={onFilterUpdate}/>

              </div>
            )
          }
        })}
      </div>
      <div className={styles.buttonsRow}>
        <DefaultButton
          text={"Add filter"}
          icon={<AddFilterIcon />}
          onClick={addFilter}
        />
        {!child && <DefaultButton
          text={"Add group"}
          icon={<AddGroupIcon />}
          onClick={addGroup}
        />}
      </div>
    </div>
  );
};

export default FilterComponent;
