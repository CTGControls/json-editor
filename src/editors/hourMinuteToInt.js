import { AbstractEditor } from '../editor.js'
import { isInteger } from '../utilities.js'

export class HourMinuteToIntEditor extends AbstractEditor {

  preBuild () {
    super.preBuild()

    //Build Hours input box
    this.inputHours = this.theme.getFormInputField('input')

    //Build Minutes input box
    this.inputMinutes = this.theme.getFormInputField('input')
  }

  build () {
    super.build()

    //Setup Hours input box
    //Set the Hours input type to a number.
    this.inputHours.setAttribute('type', 'number')

    //Set up the Hours input box as a step type
    if (!this.inputHours.getAttribute('step')) {
      this.inputHours.setAttribute('step', '1')
    }

    //Set the min and max value for the Hour input box
    this.inputHours.setAttribute('min', 0)
    this.inputHours.setAttribute('max', 166)

    //Add a class to be used for updateing 
    this.inputHours.classList.add('.inputHours')

    //Build the Hours table Cell
    const tableCellHours = this.theme.getTableCell()

    //Add the Hours input box to Hours table Cell
    tableCellHours.appendChild(this.inputHours)

    //Setup Minutes input box
    //Set up the Minutes box as a step
    this.inputMinutes.setAttribute('type', 'number')

    //Set up the Hours input box as a step type
    if (!this.inputMinutes.getAttribute('step')) {
      this.inputMinutes.setAttribute('step', '1')
    }

    //Set the min and max value for the Minutes input box
    this.inputMinutes.setAttribute('min', 0)
    this.inputMinutes.setAttribute('max', 59)

    //Add a class to be used for updateing 
    this.inputMinutes.classList.add('.inputMinutes')

    //Build the minutes table Cell
    const tableCellMinutes = this.theme.getTableCell()

    //Add the minutes input box to minutes table Cell
    tableCellMinutes.appendChild(this.inputMinutes)

    //create a table row for the control
    const tableRow = this.theme.getTableRow()
    //Add the cells to the row
    tableRow.appendChild(tableCellHours)
    tableRow.appendChild(tableCellMinutes)

    //create a table for the for the control
    const table = this.theme.getTable()

    //Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler = (e) => {
      let totalhours = isInteger(this.inputHours.value) ? parseInt(this.inputHours.value) : 0
      let totalMinutes = isInteger(this.inputMinutes.value) ? parseInt(this.inputMinutes.value) : 0
      let totalTime = (parseInt(totalhours) * 60 ) + parseInt(totalMinutes)
      this.setValue(totalTime)
      this.onChange(true)
    }

    table.addEventListener('change', this.SomeThingChangedHandler, false)

    //add the row to the table
    table.appendChild(tableRow)

    //Add the row to the AbstractEditor base container
    this.container.appendChild(table)

  }

  setValue (value, initial) {
    if (value < 0) {
      value = 0
      this.value = 0
    }

    if (value >= 60) {
      this.inputHours.value = parseInt(Math.floor(value / 60))
      this.inputMinutes.value = value % 60
    }else
    {
      this.inputHours.value = 0
      this.inputMinutes.value = value
    }

    this.value = value
    this.onChange(true)
  }
}
