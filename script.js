let addBtn = document.querySelector('.addBtn')
let removeBtn = document.querySelector('.removeBtn')
let modalCont = document.querySelector('.modalCont')
let mainCont = document.querySelector('.mainCont')
let textareaCont = document.querySelector('.textareaCont')
let toolBoxColors = document.querySelectorAll('.color')

let colors = ['lightpink', 'lightblue', 'lightgreen', 'black']
// Default Selected black color
let modalPriorityColor = colors[colors.length - 1]

let allPriorityColors = document.querySelectorAll('.priorityColor')

let addFlag = false
let removeFlag = false

let lockClass = 'fa-lock'
let unLockClass = 'fa-lock-open'

let ticketsArr = []

// Use to retrieve data from local stroage
if (localStorage.getItem('jira_tickets')) {
    ticketsArr = JSON.parse(localStorage.getItem('jira_tickets'))
    ticketsArr.forEach((ticketObj, idx) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
    })
}
// But above methods have limitation for large numbers of data,So we will use below data
// Use to retrieve data from local storage
// async function getTicketsFromStorage() {
//     let ticketsFromStorage = []
//     ticketsFromStorage = await JSON.parse(localStorage.getItem('jira_tickets'))

//     if (ticketsFromStorage && ticketsFromStorage.length > 0) {
//         ticketsFromStorage.forEach((ticketObj, idx) => {
//             createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
//         })
//     }

//     ticketsArr = ticketsFromStorage
// }

// getTicketsFromStorage()

for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener('click', (e) => {
        console.log('Clicked')
        let currentToolBoxColor = toolBoxColors[i].classList[0]
        let filteredTicket = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor
            console.log(filteredTicket)
        })
        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll('.ticketCont')
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove()
        }

        // Display new filtered tickets
        filteredTicket.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
    })

    toolBoxColors[i].addEventListener('dblclick', (e) => {
        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll('.ticketCont')
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove()
        }
        // Display All filtered tickets
        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
    })
}

// Listener for modal priority color
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener('click', (e) => {
        // For Border Removal
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove('border')
        })
        colorElem.classList.add('border')
        modalPriorityColor = colorElem.classList[0]
    })
})

addBtn.addEventListener('click', (e) => {
    // Display modal
    // Create modal

    // addFlag, true -> modal display
    // addFlag, false -> modal none
    // addFlag=!addFlag provide toggling facility
    addFlag = !addFlag

    if (addFlag) {
        modalCont.style.display = 'flex'
    } else {
        modalCont.style.display = 'none'
    }
})

removeBtn.addEventListener('click', (e) => {
    removeFlag = !removeFlag
})

modalCont.addEventListener('keydown', (e) => {
    let key = e.key
    if (key === 'Shift') {
        createTicket(modalPriorityColor, textareaCont.value)

        addFlag = false
        setModalToDefault()
    }
})

function createTicket(ticketColor, ticketTask, ticketId) {
    let id = ticketId || shortid()
    let ticketCont = document.createElement('div')
    ticketCont.setAttribute('class', 'ticketCont')
    ticketCont.innerHTML = `
        <div class="ticketColor ${ticketColor}" ></div>
            <div class="ticketId">#${id}</div>
            <div class="ticketTaskArea">${ticketTask}</div>
            <div class="ticketLock"><i class="fas fa-lock"></i></div>

  `
    mainCont.appendChild(ticketCont)

    // Create object of ticket and add to array
    if (!ticketId) {
        ticketsArr.push({ ticketColor, ticketTask, ticketId: id })
        localStorage.setItem('jira_tickets', JSON.stringify(ticketsArr))
    }

    handleRemoval(ticketCont, id)
    handleLock(ticketCont, id)
    handleColor(ticketCont, id)
}

function handleRemoval(ticket, id) {
    // removeFlag -> true ->remove
    ticket.addEventListener('click', (e) => {
        if (!removeFlag) return

        let idx = getTicketIdx(id)
        //  DB removal
        ticketsArr.splice(idx, 1)
        let strTicketsArr = JSON.stringify(ticketsArr)
        localStorage.setItem('jira_tickets', strTicketsArr)
        //    UI removal
        ticket.remove()
    })
}

function handleLock(ticket, id) {
    let ticketLockElem = ticket.querySelector('.ticketLock')
    let ticketLock = ticketLockElem.children[0]
    let ticketTaskArea = ticket.querySelector('.ticketTaskArea')
    ticketLock.addEventListener('click', (e) => {
        let ticketIdx = getTicketIdx(id)
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass)
            ticketLock.classList.add(unLockClass)
            ticketTaskArea.setAttribute('contenteditable', 'true')
        } else {
            ticketLock.classList.remove(unLockClass)
            ticketLock.classList.add(lockClass)
            ticketTaskArea.setAttribute('contenteditable', 'false')
        }

        // Modify data in Local Storage (task area)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText
        localStorage.setItem('jira_tickets', JSON.stringify(ticketsArr))
    })
}

function handleColor(ticket, id) {
    let ticketColor = ticket.querySelector('.ticketColor')
    ticketColor.addEventListener('click', (e) => {
        // Get Ticketidx from ticket arrays
        let ticketIdx = getTicketIdx(id)
        let currentTicketColor = ticketColor.classList[1]
        // Get ticket color idx
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color
        })
        currentTicketColorIdx++
        let newTicketColorIdx = currentTicketColorIdx % colors.length
        let newTicketColor = colors[newTicketColorIdx]
        ticketColor.classList.remove(currentTicketColor)
        ticketColor.classList.add(newTicketColor)

        // Modify data in local storage (prioritycolor change)

        ticketsArr[ticketIdx].ticketColor = newTicketColor
        localStorage.setItem('jira_tickets', JSON.stringify(ticketsArr))
    })
}

function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketId === id
    })
    return ticketIdx
}

function setModalToDefault() {
    modalCont.style.display = 'none'
    textareaCont.value = ''
    modalPriorityColor = colors[colors.length - 1]
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove('border')
    })

    allPriorityColors[allPriorityColors.length - 1].classList.add('border')
}
