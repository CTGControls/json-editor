import { AbstractEditor } from '../editor.js'
import { isInteger, isNumber } from '../utilities.js'

export class HourMinuteToIntEditor extends AbstractEditor {
  preBuild () {
    super.preBuild()

    // Build Hours input box
    this.inputHours = this.buildInputBox(0,null)

    // Build Minutes input box
    this.inputMinutes = this.buildInputBox(0,59)

    // Add a lable for the inputHours
    this.lable = this.header = this.theme.getFormInputLabel(this.getTitle(), this.isRequired())

    // create a table for the for the controls
    this.table = this.theme.getTable()

    // Add the lable to the tables top row
    if (this.lable.innerText !== ''){
      const tableCellTitle = this.theme.getTableCell()
      tableCellTitle.appendChild(this.lable)
      const tableRowTitle = this.theme.getTableRow()
      tableRowTitle.appendChild(tableCellTitle)
      this.table.appendChild(tableRowTitle)
    } 
  }

  //used to build a input box with all Attribute needed
  buildInputBox (min, max) {
    const input = this.theme.getFormInputField('input')

    // Set the input type to a number.
    input.setAttribute('type', 'number')

    // Set up the input box as a step type
    if (!input.getAttribute('step')) {
      input.setAttribute('step', '1')
    }

    // Set the minimum value for the input box from the schema
    if (min === 'undefined' || min === null ) {    
        if (typeof this.schema.minimum !== 'undefined') {
          let { minimum } = this.schema

          if (typeof this.schema.exclusiveMinimum !== 'undefined') {
            minimum += 1
          }

          if (minimum > 0) {
            input.setAttribute('min', minimum)
          } else {
            input.setAttribute('min', 0)
          }
      }
    } else {
      //if the minimum value is overridden set from the caller 
      input.setAttribute('min', min)
    }

    // Set the maximum value for the input box from the schema
    if (max === 'undefined' || max === null ) {    
      if (typeof this.schema.maximum !== 'undefined') {
        let { maximum } = this.schema

        if (typeof this.schema.exclusiveMaximum !== 'undefined') {
          maximum -= 1
        }

        if (maximum > 0) {
          input.setAttribute('max', Math.floor((maximum - 59) / 60))
        } else {
          input.setAttribute('max', 59)
        }
      }
    } else {
      //if the maximum value is overridden set from the caller 
      input.setAttribute('max', max)
    }
    
  
  return input
  }

  build () {
    super.build()

    // Build the Hours table Cell
    const tableCellHours = this.theme.getTableCell()

    // Add the Hours input box to Hours table Cell
    tableCellHours.appendChild(this.inputHours)

    // Build the minutes table Cell
    const tableCellMinutes = this.theme.getTableCell()

    // Add the minutes input box to minutes table Cell
    tableCellMinutes.appendChild(this.inputMinutes)

    // create a table row for the control
    const tableRow = this.theme.getTableRow()
    // Add the cells to the row
    tableRow.appendChild(tableCellHours)
    tableRow.appendChild(tableCellMinutes)

    // Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler = (e) => {
      const totalhours = isInteger(this.inputHours.value) ? parseInt(this.inputHours.value) : 0
      const totalMinutes = isInteger(this.inputMinutes.value) ? parseInt(this.inputMinutes.value) : 0
      const totalTime = (parseInt(totalhours) * 60) + parseInt(totalMinutes)
      this.setValue(totalTime)
      this.onChange(true)
    }

    // add a change event handler to the table
    this.table.addEventListener('change', this.SomeThingChangedHandler, false)

    // add the row to the table
    this.table.appendChild(tableRow)

    // Add the table to the AbstractEditor base container
    this.container.appendChild(this.table)
  }

  // called by the SomeThingChangedHandler
  // every time the control is changed
  setValue (value, initial) {
    // Check to see if the value is a number
    value = isNumber(value.toString()) ? value : 0

    // Check to see if the value is a int
    value = isInteger(value.toString()) ? parseInt(value) : 0

    // Check to see if the number is less then zero
    if (value < 0) {
      value = 0
      this.value = 0
    }

    // if the number is one hour or more do the math to separate the hours and minutes
    // else just move the value to the minutes
    if (value >= 60) {
      this.inputHours.value = parseInt(Math.floor(value / 60))
      this.inputMinutes.value = parseInt(Math.floor(value % 60))
    } else {
      this.inputHours.value = 0
      this.inputMinutes.value = value
    }

    // update the global storge value
    this.value = value
    this.onChange(true)
  }
}
