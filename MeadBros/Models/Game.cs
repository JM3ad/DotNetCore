using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeadBros.Models
{
    public abstract class Game<T> where T : Player, new()
    {
        public List<T> players = new List<T>();
        public string lobby;

        public abstract void GenerateGame();
        public Game() {}

        public void AddPlayer(string connectionId, string playerName)
        {
            var newPlayer = new T();
            newPlayer.SetDetails(connectionId, playerName);
            players.Add(newPlayer);
        }

        public void RemovePlayer(string connectionId) {
            players.RemoveAll(p => p.ConnectionId == connectionId);
        }
        
        public bool IsEmpty()
        {
            return players.Count == 0;
        }
    }
}
