using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MeadBros.Models;
using Microsoft.AspNetCore.SignalR;

namespace MeadBros.Hubs
{
    public class GameHub : Hub
    {
        private static Dictionary<string, DeceptionGame> groupCount = new Dictionary<string, DeceptionGame>();

        public Task JoinLobby(string lobby)
        {
            if (!groupCount.ContainsKey(lobby))
            {
                return Clients.Caller.SendAsync("FailedJoinLobby", lobby);
            }
            groupCount[lobby].AddPlayer(Context.ConnectionId);
            Clients.Caller.SendAsync("JoinedLobby", lobby);
            return Groups.AddToGroupAsync(Context.ConnectionId, lobby);
        }

        public Task CreateLobby()
        {
            var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var stringChars = new char[6];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = possibleChars[random.Next(possibleChars.Length)];
            }
            var lobby = new string(stringChars);
            groupCount.Add(lobby, new DeceptionGame() { lobby = lobby });
            return JoinLobby(lobby);
        }

        public Task LeaveLobby(string lobby)
        {
            if (!groupCount.ContainsKey(lobby))
            {
                return Task.CompletedTask;
            }
            groupCount[lobby].RemovePlayer(Context.ConnectionId);
            if (groupCount[lobby].IsEmpty())
            {
                groupCount.Remove(lobby);
            }
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, lobby);
        }

        public Task StartGame(string lobby)
        {
            groupCount[lobby].GenerateGame();
            Clients.Group(lobby).SendAsync("GameStarted", lobby);
            return SendPlayerDetails(lobby);
        }

        public Task SendPlayerDetails(string lobby)
        {
            var game = groupCount[lobby];
            foreach(var player in game.players)
            {
                Clients.Client(player.connectionId).SendAsync("ReceiveDetails", player.IsUndercover);
            }
            return Task.CompletedTask;
        }

        public Task ReceiveVote(string lobby, Direction direction)
        {
            var game = groupCount[lobby];
            game.players.Where(p => p.connectionId == Context.ConnectionId).First().Vote = direction;
            if (game.players.All(p => p.Vote != Direction.Unknown))
            {
                return ResolveRound(lobby);
            }
            return Task.CompletedTask;
        }

        public Task ResolveRound(string lobby)
        {
            var game = groupCount[lobby];
            var result = game.GetResultOfVote();
            Clients.Group(lobby).SendAsync("VoteResults", result);
            return SendAmbushResultsAsync(lobby);
        }

        public Task SendAmbushResultsAsync(string lobby)
        {
            Thread.Sleep(5000);
            var game = groupCount[lobby];
            var success = game.DidDefeatAttack();
            game.StartNextRound();
            return Clients.Group(lobby).SendAsync("AmbushResult", success);
        }

        public Task SendMessage(string message, string lobby)
        {
            return Clients.Group(lobby).SendAsync("ReceiveMessage", message);
        }
    }
}
