//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    //enum permet de définir l'état de la tache
    enum TaskState { TODO, DOING, DONE}

    //struct nous permet de sructurer nos données
    struct Task {
        string description;
        TaskState state;
        uint creationDate;
    }

    //on definie notre tableau pour y stocker nos taches
    Task[] private tasks;

    //Déclaration de l'adresse du owner
    address payable private owner;

    //Mapping pour suivre les paiements liés aux tâches
    mapping(address => uint) private taskPayments;

    //Déclaration du coût de création d'une tâche
    uint private constant TASK_CREATION_COST = 0.01 ether;

    // modifier pour restreindre l'accès au propriétaire 
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    // Constructeur pour définir le propriétaire du contrat
    constructor() {
        owner = payable(msg.sender);
    }

    //On est sur un crud classique
    //Fonction de creation des taches (peu recevoir de l'ether car payable)
    function createTask(string memory _description) public payable {
        require(msg.value == TASK_CREATION_COST, "You must send exactly 0.01 ether to create a task");
        tasks.push(Task({description:_description, state: TaskState.TODO,creationDate: block.timestamp}));
        //Enregistre le paiement pour permettre un remboursement en cas de suppression
        taskPayments[msg.sender] += msg.value;
    }

    //Fonction de mise à jour des taches
    function updateTask(uint _taskId, string memory _description, TaskState _state) public {
        require(_taskId < tasks.length, "Task does not exist");
        tasks[_taskId].description = _description;
        tasks[_taskId].state = _state;
    }

    //Function de suppression d'une tache
    function deleteTask(uint _taskId) public {
        require(_taskId < tasks.length, "Task does not exist");
        //Identifie le créateur à rembourser
        address taskCreator = msg.sender;
        uint refundAmount = TASK_CREATION_COST;
        require(taskPayments[taskCreator] >= refundAmount, "No funds available for refund");
        //je pop pour supprimé l'élément du tableau car le delete ne re reduit pas la taille et me laisse un troue dans mon array...
        tasks[_taskId] = tasks[tasks.length - 1];
        tasks.pop();
        //remboursement
        taskPayments[taskCreator] -= refundAmount;
        payable(taskCreator).transfer(refundAmount);
    }

    //Fonction de lecture du tableau des taches
    function readTask() public view returns (Task[] memory) {
        return tasks;
    }

        //Fonction pour récupérer le solde du contrat du proprietaire
    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}