using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeadBros.Models
{
    public class DeceptionGame
    {
        public List<DeceptionPlayer> players = new List<DeceptionPlayer>();
        public List<Direction> attacks = new List<Direction>();
        public List<bool> defeatedOrcs = new List<bool>();
        public string lobby;
        public static Dictionary<Direction, int> votes = GetResetVotes();
        private int roundNumber = 0;
        private const int numberOfRounds = 5;
        private const int failuresAllowed = 2;

        public void GenerateGame()
        {
            GenerateAttackOrder(numberOfRounds);
            RandomiseAgent();
        }

        private void GenerateAttackOrder(int numberOfRounds)
        {
            for (int i = 0; i < numberOfRounds; i++)
            {
                attacks.Add(GenerateRandomDirection());
            }
        }

        private void RandomiseAgent()
        {
            players.OrderBy(p => Guid.NewGuid());
            players[0].IsUndercover = true;
        }

        public void StartNextRound()
        {
            if (!IsFinished())
            {
                GetResetVotes();
                roundNumber++;
                foreach( var player in players)
                {
                    player.Vote = Direction.Unknown;
                }
            }
        }

        public bool IsFinished()
        {
            return roundNumber == numberOfRounds;
        }

        public List<Direction> GetResultOfVote()
        {
            votes = GetResetVotes();
            foreach(var player in players)
            {
                votes[player.Vote] += 1;
            }

            return votes.OrderByDescending(v => v.Value).Take(2).Select(v => v.Key).ToList();
        }

        public bool DidDefeatAttack()
        {
            return GetResultOfVote().Contains(attacks[roundNumber]);
        }

        public void AddPlayer(string connectionId)
        {
            players.Add(new DeceptionPlayer(connectionId));
        }

        public void RemovePlayer(string connectionId)
        {
            players.RemoveAll(p => p.connectionId == connectionId);
        }

        public bool IsEmpty()
        {
            return players.Count == 0;
        }

        public string GetHintForPlayer(DeceptionPlayer player)
        {
            if (player.IsUndercover)
            {
                return $"They're coming from the {attacks[roundNumber]}!";
            }
            return $"Doesn't sound like they're coming from the {GenerateIntel()}";
        }

        public bool HaveCaptainsWon()
        {
            return numberOfRounds == roundNumber && defeatedOrcs.Sum(result => result ? 1 : 0) < numberOfRounds - failuresAllowed;
        }

        private string GenerateIntel()
        {
            var rand = new Random();
            if (rand.Next(20) <= 1)
            {
                return attacks[roundNumber].ToString();
            }
            var directions = new List<Direction>
            {
                Direction.North,
                Direction.East,
                Direction.South,
                Direction.West
            };
            directions.Remove(attacks[roundNumber]);
            return directions.OrderBy(x => rand.NextDouble()).First().ToString();
        }

        private Direction GenerateRandomDirection()
        {
            var directions = Enum.GetValues(typeof(Direction));
            return (Direction) directions.GetValue(new Random().Next(1, directions.Length));
        }

        private static Dictionary<Direction, int> GetResetVotes()
        {
            return new Dictionary<Direction, int>
            {
                { Direction.North, 0 },
                { Direction.East, 0 },
                { Direction.South, 0 },
                { Direction.West, 0 }
            };
        }
    }
}
