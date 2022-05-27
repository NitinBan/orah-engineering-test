import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSortUp, faSortDown, faSearch } from "@fortawesome/free-solid-svg-icons"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { RollInput } from "shared/models/roll"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [students, setStudents] = useState<Person[]>([])
  const [filteredSstudents, setFilteredSstudents] = useState<Person[]>([])
  const [attendance, setAttendance] = useState<RollInput>({ student_roll_states: [] })
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (loadState === "loaded") {
      const studentsList: Person[] = data!.students
      setStudents(studentsList)
      setFilteredSstudents(studentsList)
    }
  }, [loadState])

  const onToolbarAction = (action: ToolbarAction, value?: String) => {
    if (action === "roll") {
      setIsRollMode(true)
    } else if (action === "sort") {
      handleSort(value)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const getSearchCondition = (item: Person, value: String) => {
    const name: String = item.first_name + " " + item.last_name
    const nameCheck = name.toLowerCase().includes(value.toLowerCase())
    return nameCheck
  }

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim()) {
      const filteredData = students.filter((item) => getSearchCondition(item, value))
      setFilteredSstudents(() => [...filteredData])
    } else {
      setFilteredSstudents(() => [...students])
    }
  }

  const handleSort = (value?: String) => {
    let sortedList: Person[] = []

    if (value === "asc_by_first_name") sortedList = filteredSstudents.sort((a, b) => (a.first_name < b.first_name ? -1 : 1))
    else if (value === "dsc_by_first_name") sortedList = filteredSstudents.sort((a, b) => (a.first_name > b.first_name ? -1 : 1))
    else if (value === "asc_by_last_name") sortedList = filteredSstudents.sort((a, b) => (a.last_name < b.last_name ? -1 : 1))
    else if (value === "dsc_by_last_name") sortedList = filteredSstudents.sort((a, b) => (a.last_name > b.last_name ? -1 : 1))

    console.log("sortedList", sortedList)
    setFilteredSstudents(() => [...sortedList])
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} onSearch={onSearch} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {console.log("filteredSstudents", filteredSstudents)}

        {loadState === "loaded" && filteredSstudents?.length ? (
          filteredSstudents.map((s) => <StudentListTile key={s.id} isRollMode={isRollMode} student={s} attendance={attendance} setAttendance={setAttendance} />)
        ) : (
          <CenteredContainer>
            <div>No Data</div>
          </CenteredContainer>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} attendance={attendance} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, onSearch } = props
  return (
    <S.ToolbarContainer>
      <div className="sortIcon">
        First Name
        <FontAwesomeIcon icon={faSortDown} title="Ascending " onClick={() => onItemClick("sort", "asc_by_first_name")} />
        <FontAwesomeIcon icon={faSortUp} title="Descending" onClick={() => onItemClick("sort", "dsc_by_first_name")} />
      </div>

      <div className="sortIcon">
        Last Name
        <FontAwesomeIcon icon={faSortDown} title="Ascending " onClick={() => onItemClick("sort", "asc_by_last_name")} />
        <FontAwesomeIcon icon={faSortUp} title="Descending" onClick={() => onItemClick("sort", "dsc_by_last_name")} />
      </div>

      <S.SearchField>
        <FontAwesomeIcon icon={faSearch} />
        <input type="search" placeholder="Search Student" onChange={onSearch} />
      </S.SearchField>

      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};

    .sortIcon {
      cursor: pointer;

      svg {
        margin-left: 5px;
      }
    }
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SearchField: styled.div`
    width: fit-content;
    height: 100%;
    position: relative;

    input {
      padding: 3px 10px;
      padding-left: 34px;
      outline: none;
    }

    svg {
      position: absolute;
      color: ${Colors.blue.base};
      height: 100%;
      margin: 0 10px;
    }
  `,
}
