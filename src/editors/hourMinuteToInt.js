import { AbstractEditor } from '../editor.js'
import { isInteger } from '../utilities.js'

export class HourMinuteToIntEditor extends AbstractEditor {
  build () {
    super.build()

    //Create hours input box
    //Build Hours input box
    const inputHours = this.theme.getFormInputField('input')

    //Set the Hours input type to a number.
    inputHours.setAttribute('type', 'number')

    //Set up the Hours input box as a step type
    if (!inputHours.getAttribute('step')) {
      inputHours.setAttribute('step', '1')
    }

    //Set the min and mmax value for the Hour input box
    inputHours.setAttribute('min', 0)
    inputHours.setAttribute('max', 166)

    //Create the Hours up down buttons
    const stepperButtonsHours = this.theme.getStepperButtons(inputHours)

    //Build the Hours table Cell
    const tableCellHours = this.theme.getTableCell()

    //Add the Hours input box to Hours table Cell
    tableCellHours.appendChild(inputHours)

    //Wire the Hours stepper buttons to the Hours input box value
    this.stepperDownHours = tableCellHours.querySelector('.stepper-down')
    this.stepperUpHours = tableCellHours.querySelector('.stepper-up')

    //Create Minutes input box
    //Build Minutes input box
    const inputMinutes = this.theme.getFormInputField('input')

    //Set up the Minutes box as a step
    inputMinutes.setAttribute('type', 'number')
    if (!inputMinutes.getAttribute('step')) {
      inputMinutes.setAttribute('step', '1')
    }

    inputMinutes.setAttribute('min', 0)
    inputMinutes.setAttribute('max', 59)

    //Create the Minutes up down buttons
    const stepperButtonsMinutes = this.theme.getStepperButtons(inputMinutes)

    //Build the minutes table Cell
    const tableCellMinutes = this.theme.getTableCell()

    //Add the minutes input box to minutes table Cell
    tableCellMinutes.appendChild(inputMinutes)

    //Wire the minutes stepper buttons to the minutes input box value
    this.stepperDownMinutes = tableCellMinutes.querySelector('.stepper-down')
    this.stepperUpMinute = tableCellMinutes.querySelector('.stepper-up')

    //create a table row for the control
    const tableRow = this.theme.getTableRow()
    //Add the cells to the row
    tableRow.appendChild(tableCellHours)
    tableRow.appendChild(tableCellMinutes)

    //create a table for the for the control
    const table = this.theme.getTable()

    //Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler = (e) => {
      let totalhours = isInteger(inputHours.value) ? parseInt(inputHours.value) : 0
      let totalMinutes = isInteger(inputMinutes.value) ? parseInt(inputMinutes.value) : 0
      let totalTime = (parseInt(totalhours) * 60 ) + parseInt(totalMinutes)
      this.setValue(totalTime)
    }

    table.addEventListener('change', this.SomeThingChangedHandler, false)

    //add the row to the table
    table.appendChild(tableRow)

    //Add the row to the AbstractEditor base container
    this.container.appendChild(table)

  }

  setValue (value, initial) {
    this.value = value
    this.onChange(true)
  }

  enable () {
    super.enable()
    this.stepperDownHours.removeAttribute('disabled')
    this.stepperUpHours.removeAttribute('disabled')
    this.stepperDownMinutes.removeAttribute('disabled')
    this.stepperUpMinute.removeAttribute('disabled')
  }

  disable () {
    super.disable()
    this.stepperDownHours.setAttribute('disabled', true)
    this.stepperUpHours.setAttribute('disabled', true)
    this.stepperDownMinutes.setAttribute('disabled', true)
    this.stepperUpMinute.setAttribute('disabled', true)
  }
}
